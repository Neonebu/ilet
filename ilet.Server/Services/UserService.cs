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
        private readonly IUserRepo<User> _userRepo;
        private readonly IMapper _mapper;
        private readonly IUserProfilePictureRepo _ppRepo;

        public UserService(IUserRepo<User> userRepo,IMapper mapper,IUserProfilePictureRepo userProfilePictureRepo)
        {
            _userRepo = userRepo;
            _mapper = mapper;
            _ppRepo = userProfilePictureRepo;
        }

        public async Task<List<User>> GetAll()
        {
            var users = await _userRepo.GetAllAsync();
            return users.ToList();
        }

        public async Task<(bool success, string token, string nickname)> CreateOrGetUser(User user)
        {
            var existingUser = (await _userRepo.GetAllAsync()).FirstOrDefault(u => u.Email == user.Email);

            if (existingUser != null)
            {
                if (existingUser.Password == user.Password)
                {
                    if (string.IsNullOrEmpty(existingUser.Nickname))
                    {
                        existingUser.Nickname = existingUser.Email;
                        _userRepo.Update(existingUser);
                        await _userRepo.SaveAsync();
                    }
                    var token = GenerateToken(existingUser);
                    return (true, token, existingUser.Nickname);
                }
                return (false, "", "");
            }

            user.Nickname = user.Email;
            user.Status = "Online"; // veya "Offline"
            await _userRepo.AddAsync(user);
            await _userRepo.SaveAsync();
            var newToken = GenerateToken(user);
            return (true, newToken, user.Nickname);
        }

        public async Task<(bool success, User? user)> GetUser(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes("super_secret_key_123");

            try
            {
                var claims = handler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = "yourapp",
                    ValidAudience = "yourapp",
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateLifetime = true
                }, out SecurityToken validatedToken);

                var userIdStr = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (!int.TryParse(userIdStr, out var userId))
                    return (false, null);

                var user = await _userRepo.GetByIdAsync(userId);
                return user != null ? (true, user) : (false, null);
            }
            catch
            {
                return (false, null);
            }
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

        public async Task<User?> GetUserById(int userId)
        {
            return await _userRepo.Query()
                .FirstOrDefaultAsync(u => u.Id == userId);
        }
        public async Task UploadProfilePicture(int userId, IFormFile file)
        {
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var bytes = ms.ToArray();

            var existing = await _ppRepo.GetByUserIdAsync(userId);

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

            await _ppRepo.SaveAsync();
        }

        public async Task<bool> CreateUserAsync(CreateUserDto dto)
        {
            // Email kontrolü
            var existingUser = await _userRepo.Query()
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (existingUser != null)
                throw new Exception("Bu email zaten kayıtlı.");

            var user = _mapper.Map<User>(dto);

            // Password hashing (opsiyonel)
            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            user.Status = "Hey there!";

            await _userRepo.AddAsync(user);
            await _userRepo.SaveAsync();
            return true;
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

            _userRepo.Update(user);
            await _userRepo.SaveAsync();
            return true;
        }
        public async Task<UserProfilePictureDto?> GetProfilePictureAsync(int userId)
        {
            var pp = await _ppRepo.GetByUserIdAsync(userId);
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
