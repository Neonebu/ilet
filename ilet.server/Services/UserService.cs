using ilet.server.Interfaces;
using ilet.server.Models;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using ilet.server.Dtos;
using Microsoft.Extensions.Caching.Memory;
using ilet.server.Services;
using ilet.server.Helpers;

namespace IletApi.Services
{
    public class UserService : IUsersService
    {
        private readonly IMemoryCache _cache;
        private readonly IRepositoryDb<Users> _userRepo;
        private readonly IRepositoryDb<UserProfilePictures> _ppRepo;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        public UserService(IRepositoryDb<Users> userRepo, IMapper mapper, IRepositoryDb<UserProfilePictures> ppRepo, IMemoryCache cache, IEmailService emailService)
        {
            _userRepo = userRepo;
            _mapper = mapper;
            _ppRepo = ppRepo;
            _cache = cache;
            _emailService = emailService;
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
                Password = AesEncryptionHelper.Encrypt(input.Password), // AES Şifreleme burada
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

            // AES çözme işlemi
            var decryptedPassword = AesEncryptionHelper.Decrypt(user.Password);

            // Şifre doğrulama
            var isPasswordValid = decryptedPassword == input.Password;
            if (!isPasswordValid)
                throw new Exception("Şifre hatalı.");

            var onlineUsers = _cache.Get<HashSet<int>>("online_users") ?? new HashSet<int>();
            var offlineUsers = _cache.Get<HashSet<int>>("offline_users") ?? new HashSet<int>();

            onlineUsers.Add(user.Id);
            offlineUsers.Remove(user.Id);

            _cache.Set("online_users", onlineUsers);
            _cache.Set("offline_users", offlineUsers);

            await WebSocketHandler.BroadcastStatusUpdate(user.Id, user.Nickname, user.Status, user.Email);

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
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
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
        public async Task UploadProfilePictureAsync(UploadProfilePictureDto dto, int userId)
        {
            using var ms = new MemoryStream();
            await dto.File.CopyToAsync(ms);
            var bytes = ms.ToArray();

            var existing = await _ppRepo.FirstOrDefaultAsync(x => x.UserId == userId);

            if (existing != null)
            {
                existing.Image = bytes;
                existing.CreatedAt = DateTime.UtcNow;
                existing.ContentType = dto.File.ContentType;
                _ppRepo.Update(existing);
            }
            else
            {
                await _ppRepo.AddAsync(new UserProfilePictures
                {
                    UserId = userId,
                    Image = bytes,
                    CreatedAt = DateTime.UtcNow,
                    ContentType = dto.File.ContentType
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
        public async Task Logout(int userId)
        {
            var onlineUsers = _cache.Get<HashSet<int>>("online_users") ?? new HashSet<int>();
            var offlineUsers = _cache.Get<HashSet<int>>("offline_users") ?? new HashSet<int>();

            onlineUsers.Remove(userId);
            offlineUsers.Add(userId);

            _cache.Set("online_users", onlineUsers);
            _cache.Set("offline_users", offlineUsers);
            var user = await _userRepo.Query().FirstOrDefaultAsync(u => u.Id == userId);
            await WebSocketHandler.BroadcastStatusUpdate(userId, user?.Nickname, user?.Status,user?.Email); // << WS yayını

            await Task.CompletedTask;
        }
        public async Task ChangeStatus(UserDto userDto)
        {
            var user = await _userRepo.FirstOrDefaultAsync(x => x.Id == userDto.Id);
            if (user == null) return;
            var userId = user.Id;
            var status = userDto.Status?.ToLower();
            var nickname = string.IsNullOrWhiteSpace(user.Nickname) ? user.Email : user.Nickname;
            var safeStatus = string.IsNullOrWhiteSpace(status) ? "offline" : status;
            var onlineUsers = _cache.Get<HashSet<int>>("online_users") ?? new HashSet<int>();
            var offlineUsers = _cache.Get<HashSet<int>>("offline_users") ?? new HashSet<int>();
            if (safeStatus == "online" || safeStatus == "busy" || safeStatus == "away")
            {
                onlineUsers.Add(userId);
                offlineUsers.Remove(userId);
            }
            else
            {
                onlineUsers.Remove(userId);
                offlineUsers.Add(userId);
            }
            _cache.Set("online_users", onlineUsers);
            _cache.Set("offline_users", offlineUsers);
            await WebSocketHandler.BroadcastStatusUpdate(userId, nickname, safeStatus, user.Email);
        }

        public async Task SendPasswordReminderEmailAsync(string email)
        {
            var user = await _userRepo.Query().FirstOrDefaultAsync(x => x.Email == email);
            if (user != null)
            {
                await _emailService.SendAsync(
                    user.Email,
                    "Şifre Hatırlatma",
                    $"Şifreniz: {user.Password}"
                );
            }
        }
    }
}
