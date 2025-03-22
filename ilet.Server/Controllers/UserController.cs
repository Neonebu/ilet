using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using IletApi.Services;
using ilet.Server.Models;
using ilet.Server.Interfaces;
using System.Security.Claims;
using AutoMapper;
using ilet.Server.Dtos;

namespace IletApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IWebHostEnvironment _env;
        private readonly IMapper _mapper;
        private readonly ILogger<UserController> _logger;
        public UserController(IUserService userService, IWebHostEnvironment env,IMapper mapper, ILogger<UserController> logger)
        {
            _userService = userService;
            _env = env;
            _mapper = mapper;
            _logger = logger;
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
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var user = await _userService.GetUserById(userId);
            if (user == null)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            // AutoMapper ile User => UserDto mapleme
            var userDto = _mapper.Map<UserDto>(user);

            // DTO içinde URL'yi tamamlıyoruz
            userDto.ProfilePictureUrl = user.ProfilePicturePath != null
                ? $"{baseUrl}/uploads/{user.ProfilePicturePath}"
                : null;

            return Ok(userDto);
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

            try
            {
                await _userService.UploadProfilePicture(userId, profilePicture);
                return Ok(new { message = "Yükleme başarılı." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Profil resmi yüklenirken hata oluştu");
                return StatusCode(500, new { message = "Sunucu hatası", error = ex.Message });
            }

        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                await _userService.CreateUserAsync(dto);
                return Ok(new { message = "Kayıt başarılı." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("update")]
        [Authorize]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var result = await _userService.UpdateUserAsync(userId, dto);
            if (!result)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            return Ok(new { message = "Kullanıcı güncellendi." });
        }
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId != null)
            {
                // Refresh token db'den sil vs.
            }
            return Ok();
        }
        [HttpGet("{userId}/profile-picture")]
        public async Task<IActionResult> GetProfilePicture(int userId)
        {
            var ppDto = await _userService.GetProfilePictureAsync(userId);
            if (ppDto == null || ppDto.Image == null)
                return NotFound();
            return File(ppDto.Image, ppDto.ContentType);

        }
    }
}
