using Microsoft.AspNetCore.Mvc;
using IletApi.Services;
using ilet.Server.Models;

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
        public IActionResult CreateOrGetUser([FromBody] User user)
        {
            var (success, token, nickname) = _userService.CreateOrGetUser(user);

            if (!success)
                return Unauthorized(new { message = "Incorrect password." });

            return Ok(new { token, nickname });
        }
    }
}
