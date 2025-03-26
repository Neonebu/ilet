using ilet.Server.Interfaces;
using ilet.Server.Models;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using ilet.Server.Dtos;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Caching.Memory;
using ilet.Server.Services;

namespace IletApi.Services
{
    public class UserService : IUsersService
    {
        private readonly IMemoryCache _cache;
        private readonly IRepositoryDb<Users> _userRepo;
        private readonly IRepositoryDb<UserProfilePictures> _ppRepo;
        private readonly IMapper _mapper;
        public UserService(IRepositoryDb<Users> userRepo, IMapper mapper, IRepositoryDb<UserProfilePictures> ppRepo, IMemoryCache cache)
        {
            _userRepo = userRepo;
            _mapper = mapper;
            _ppRepo = ppRepo;
            _cache = cache;
        }
        public async Task<List<Users>> GetAll()
        {
            var users = await _userRepo.GetAllAsync();
            return users.ToList();
        }
        public async Task<UserDto> Signup(CreateUserRequestDto input)
        {
            var existingUser = await _userRepo.Query()
                .FirstOrDefaultAsync(u => u.Email == input.Email);

            if (existingUser != null)
                throw new Exception("Bu email zaten kayıtlı.");

            var user = new Users
            {
                Email = input.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(input.Password),
                Nickname = input.Email, // İlk nickname olarak email atanabilir
                Status = "Online",  // Varsayılan bir durum
                Language = input.Language // Eğer DTO'da varsa
            };

            await _userRepo.AddAsync(user);
            await _userRepo.SaveAsync();

            var userDto = _mapper.Map<UserDto>(user);
            return userDto;
        }
        public async Task<UserDto> Login(LoginRequestDto input)
        {
            var user = await _userRepo.Query().FirstOrDefaultAsync(u => u.Email == input.Email);
            if (user == null)
                throw new Exception("Kullanıcı bulunamadı.");

            var isPasswordValid = BCrypt.Net.BCrypt.Verify(input.Password, user.Password);
            if (!isPasswordValid)
                throw new Exception("Şifre hatalı.");

            var onlineUsers = _cache.Get<HashSet<int>>("online_users") ?? new HashSet<int>();
            var offlineUsers = _cache.Get<HashSet<int>>("offline_users") ?? new HashSet<int>();

            // Kullanıcıyı online listesine ekle
            onlineUsers.Add(user.Id);

            // Offline listesinden çıkar
            offlineUsers.Remove(user.Id);

            // Cache güncelle
            _cache.Set("online_users", onlineUsers);
            _cache.Set("offline_users", offlineUsers);

            // WebSocket üzerinden tüm clientlara status güncellemesini gönder
            await WebSocketHandler.BroadcastStatusUpdate();

            var userDto = _mapper.Map<UserDto>(user);
            return userDto;
        }
        public async Task<UserDto?> GetUser(int userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return null;

            var userDto = _mapper.Map<UserDto>(user);
            return userDto;
        }
        public string GenerateToken(Users user)
        {
            var claims = new[]
            {
        new Claim(JwtRegisteredClaimNames.Email, user.Email),
        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString())

    };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("V3ry_Str0ng_S3cret_Key_123456789!@#"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "yourapp",
                audience: "yourapp",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        public async Task UploadProfilePicture(int userId, IFormFile file)
        {
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var bytes = ms.ToArray();

            var existing = await _ppRepo.FirstOrDefaultAsync(x => x.UserId == userId);

            if (existing != null)
            {
                existing.Image = bytes;
                existing.CreatedAt = DateTime.UtcNow;
                _ppRepo.Update(existing);
            }
            else
            {
                await _ppRepo.AddAsync(new UserProfilePictures
                {
                    UserId = userId,
                    Image = bytes,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _ppRepo.SaveAsync();
        }
        public async Task<bool> UpdateUserAsync(int userId, UpdateUserDto dto)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return false;
            if (dto.Nickname != null)
                user.Nickname = dto.Nickname;
            if (dto.Status != null)
                user.Status = dto.Status;
            if (dto.Language != null)
                user.Language = dto.Language;
            _userRepo.Update(user);
            await _userRepo.SaveAsync();
            return true;
        }
        public async Task<UserProfilePictureDto?> GetProfilePictureAsync(int userId)
        {
            var entity = await _ppRepo.FirstOrDefaultAsync(p => p.UserId == userId);
            if (entity == null)
                return null;
            return _mapper.Map<UserProfilePictureDto>(entity);
        }
        public async Task<List<UserDto>> GetOnlineUsers()
        {
            var userIds = _cache.Get<HashSet<int>>("online_users") ?? new HashSet<int>();

            Console.WriteLine("🔵 [Cache'deki ID'ler]");
            foreach (var id in userIds)
            {
                Console.WriteLine($"- ID: {id}");
            }

            var idList = userIds.ToList();

            var users = await _userRepo.WhereAsync(u => idList.Contains(u.Id));

            Console.WriteLine("🟢 [DB'den gelen kullanıcılar]");
            foreach (var u in users)
            {
                Console.WriteLine($"- ID: {u.Id} | Nickname: {u.Nickname}");
            }

            var userDtos = _mapper.Map<List<UserDto>>(users);
            return userDtos;
        }
        public async Task<List<UserDto>> GetOfflineUsers()
        {
            var offlineUserIds = _cache.Get<HashSet<int>>("offline_users") ?? new HashSet<int>();

            Console.WriteLine("🔴 [Cache dışı kullanıcılar]");

            var allUsers = await _userRepo.GetAllAsync();

            var offlineUsers = allUsers.Where(u => !offlineUserIds.Contains(u.Id)).ToList();

            foreach (var u in offlineUsers)
            {
                Console.WriteLine($"- ID: {u.Id} | Nickname: {u.Nickname}");
            }

            var userDtos = _mapper.Map<List<UserDto>>(offlineUsers);
            return userDtos;
        }
        public async Task Logout(int userId)
        {
            var onlineUsers = _cache.Get<HashSet<int>>("online_users") ?? new HashSet<int>();
            var offlineUsers = _cache.Get<HashSet<int>>("offline_users") ?? new HashSet<int>();

            onlineUsers.Remove(userId);
            offlineUsers.Add(userId);

            _cache.Set("online_users", onlineUsers);
            _cache.Set("offline_users", offlineUsers);

            await WebSocketHandler.BroadcastStatusUpdate(); // << WS yayını

            await Task.CompletedTask;
        }
        public async Task ChangeStatus(int userId, string status)
        {
            var onlineUsers = _cache.Get<HashSet<int>>("online_users") ?? new HashSet<int>();
            var offlineUsers = _cache.Get<HashSet<int>>("offline_users") ?? new HashSet<int>();

            if (status == "online")
            {
                onlineUsers.Add(userId);
                offlineUsers.Remove(userId);
            }
            else if (status == "offline")
            {
                onlineUsers.Remove(userId);
                offlineUsers.Add(userId);
            }

            _cache.Set("online_users", onlineUsers);
            _cache.Set("offline_users", offlineUsers);

            await WebSocketHandler.BroadcastStatusUpdate(); // realtime güncelleme

            await Task.CompletedTask;
        }
    }
}
