using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using IletApi.Services;
using ilet.Server.Models;
using ilet.Server.Interfaces;
using System.Security.Claims;

namespace IletApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("login")]
        public IActionResult CreateOrGetUsers([FromBody] User user)
        {
            var (success, token, nickname) = _userService.CreateOrGetUser(user);

            if (!success)
                return Unauthorized(new { message = "Incorrect password." });

            return Ok(new { token, nickname });
        }

        [HttpGet("getUser")]
        [Authorize]
        public IActionResult GetUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = _userService.GetUserById(userId);

            if (user == null)
                return NotFound();

            return Ok(new { nickname = user.Nickname, email = user.Email });
        }
    }
}
