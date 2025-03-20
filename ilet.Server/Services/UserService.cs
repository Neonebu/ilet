using ilet.Server.Context;
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
        private readonly AppDbContext _db;

        public UserService(AppDbContext db)
        {
            _db = db;
        }

        public List<User> GetAll()
        {
            return _db.Users.ToList();
        }

        public (bool success, string token, string nickname) CreateOrGetUser(User user)
        {
            var existingUser = _db.Users.FirstOrDefault(u => u.Email == user.Email);

            if (existingUser != null)
            {
                if (existingUser.Password == user.Password)
                {
                    if (string.IsNullOrEmpty(existingUser.Nickname))
                    {
                        existingUser.Nickname = existingUser.Email;
                        _db.SaveChanges();
                    }
                    var token = GenerateToken(existingUser);
                    return (true, token, existingUser.Nickname);
                }
                return (false, "", "");
            }

            user.Nickname = user.Email;
            _db.Users.Add(user);
            _db.SaveChanges();
            return (true, "dummy-token", user.Nickname);
        }
        public (bool success, User user) GetUser(string token)
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

                var user = _db.Users.FirstOrDefault(u => u.Id.ToString() == userId);

                if (user == null)
                    return (false, null);

                return (true, user);
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

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("super_secret_key_123")); // bu secret appsettings'e gider normalde
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
        public User GetUserById(string userId)
        {
            return _db.Users.FirstOrDefault(u => u.Id.ToString() == userId);
        }

    }
}
