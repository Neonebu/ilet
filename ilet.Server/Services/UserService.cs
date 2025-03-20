using ilet.Server.Interfaces;
using ilet.Server.Models;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace IletApi.Services
{
    public class UserService : IUserService
    {
        private readonly IRepo<User> _userRepo;

        public UserService(IRepo<User> userRepo)
        {
            _userRepo = userRepo;
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

                var userId = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
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

        public async Task<User?> GetUserById(string userId)
        {
            return await _userRepo.GetByIdAsync(userId);
        }

        public async Task<bool> UpdateProfilePicture(string userId, string fileName)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return false;

            user.ProfilePicturePath = fileName;
            _userRepo.Update(user);
            await _userRepo.SaveAsync();
            return true;
        }
    }
}
