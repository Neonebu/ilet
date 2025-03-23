using ilet.Server.Interfaces;
using ilet.Server.Models;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using ilet.Server.Dtos;

namespace IletApi.Services
{
    public class UserService : IUserService
    {
        private readonly IRepositoryDb<User> _userRepo;
        private readonly IRepositoryDb<UserProfilePicture> _ppRepo;
        private readonly IMapper _mapper;
        public UserService(IRepositoryDb<User> userRepo,IMapper mapper, IRepositoryDb<UserProfilePicture> ppRepo)
        {
            _userRepo = userRepo;
            _mapper = mapper;
            _ppRepo = ppRepo;
        }

        public async Task<List<User>> GetAll()
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

            var user = new User
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
            var user = await _userRepo.Query()
                .FirstOrDefaultAsync(u => u.Email == input.Email);

            if (user == null)
                throw new Exception("Kullanıcı bulunamadı.");

            var isPasswordValid = BCrypt.Net.BCrypt.Verify(input.Password, user.Password);

            if (!isPasswordValid)
                throw new Exception("Şifre hatalı.");

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
        public string GenerateToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("V3ry_Str0ng_S3cret_Key_123456789!@#"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "yourapp",
                audience: "yourapp",
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        public async Task UploadProfilePicture(int userId, IFormFile file)
        {
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var bytes = ms.ToArray();

            var existing = await _ppRepo.GetByIdAsync(userId);

            if (existing != null)
            {
                existing.Image = bytes;
                existing.CreatedAt = DateTime.UtcNow;
                _ppRepo.Update(existing);
            }
            else
            {
                await _ppRepo.AddAsync(new UserProfilePicture
                {
                    UserId = userId,
                    Image = bytes,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _userRepo.SaveAsync();
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
            if (dto.ProfilePicturePath != null)
                user.ProfilePicturePath = dto.ProfilePicturePath;
            if(dto.Language != null) 
                user.Language = dto.Language;
            _userRepo.Update(user);
            await _userRepo.SaveAsync();
            return true;
        }
        public async Task<UserProfilePictureDto?> GetProfilePictureAsync(int userId)
        {
            var pp = await _ppRepo.GetByIdAsync(userId);
            if (pp == null || pp.Image == null)
                return null;

            return new UserProfilePictureDto
            {
                Image = pp.Image,
                ContentType = "image/jpeg"
            };
        }
    }
}
