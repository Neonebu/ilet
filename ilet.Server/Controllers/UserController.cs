using Microsoft.AspNetCore.Mvc;
using ilet.Server.Context;
using ilet.Server.Models;

namespace IletApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UserController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _db.Users.ToList();
            return Ok(users);
        }

        [HttpPost]
        public IActionResult Create([FromBody] User user)
        {
            var existingUser = _db.Users.FirstOrDefault(u => u.Email == user.Email);

            if (existingUser != null)
            {
                if (existingUser.Password == user.Password)
                {
                    // Kullanıcı login oluyor, nickname değiştirmediyse mail kalsın
                    existingUser.Nickname ??= existingUser.Email;
                    return Ok(new { token = "dummy-token", nickname = existingUser.Nickname });
                }
                else
                {
                    return Unauthorized(new { message = "Incorrect password." });
                }
            }
            else
            {
                // Yeni kayıt
                user.Nickname = user.Email;
                _db.Users.Add(user);
                _db.SaveChanges();
                return Ok(new { token = "dummy-token", nickname = user.Nickname });
            }
        }

    }
}
