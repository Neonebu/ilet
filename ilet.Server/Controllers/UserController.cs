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
        private readonly IWebHostEnvironment _env;
        public UserController(IUserService userService, IWebHostEnvironment env)
        {
            _userService = userService;
            _env = env;
        }
        [HttpGet("/")]
        public IActionResult Index()
        {
            return Ok("API is working!");
        }

        [HttpPost("login")]
        public async Task<IActionResult> CreateOrGetUsers([FromBody] User user)
        {
            var (success, token, nickname) = await _userService.CreateOrGetUser(user);

            if (!success)
                return Unauthorized(new { message = "Incorrect password." });

            return Ok(new { token, nickname });
        }

        [HttpGet("getUser")]
        [Authorize]
        public async Task<IActionResult> GetUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userService.GetUserById(userId);

            if (user == null)
                return NotFound();

            return Ok(new { nickname = user.Nickname, email = user.Email });
        }
        [HttpPost("uploadProfilePic")]
        [Authorize]
        public async Task<IActionResult> UploadProfilePic([FromForm] IFormFile profilePicture)
        {
            if (profilePicture == null || profilePicture.Length == 0)
                return BadRequest(new { message = "Dosya seçilmedi." });

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{userId}_{Path.GetFileName(profilePicture.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await profilePicture.CopyToAsync(stream);
            }

            var success = await _userService.UpdateProfilePicture(userId, fileName);
            if (!success)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            var fileUrl = $"/uploads/{fileName}";
            return Ok(new { message = "Yükleme başarılı.", url = fileUrl });
        }

    }
}
