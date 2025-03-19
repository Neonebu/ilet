using Microsoft.AspNetCore.Mvc;
using IletApi.Services;
using ilet.Server.Models;
using ilet.Server.Interfaces;

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
        [HttpPost]
        public IActionResult CreateOrGetUsers([FromBody] User user)
        {
            var (success, token, nickname) = _userService.CreateOrGetUser(user);

            if (!success)
                return Unauthorized(new { message = "Incorrect password." });

            return Ok(new { token, nickname });
        }
        [HttpGet("getUser")]
        public IActionResult GetUser()
        {
            var authHeader = HttpContext.Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader == null || !authHeader.StartsWith("Bearer "))
                return Unauthorized();

            var token = authHeader.Substring("Bearer ".Length);

            var result = _userService.GetUser(token);

            if (!result.success)
                return Unauthorized();

            return Ok(new { nickname = result.user.Nickname, email = result.user.Email });
        }


    }
}
