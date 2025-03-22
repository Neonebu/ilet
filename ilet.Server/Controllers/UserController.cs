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
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto input)
        {
            try
            {
                var userDto = await _userService.Login(input);

                // Token üretelim:
                var token = _userService.GenerateToken(new User { Id = userDto.Id, Email = userDto.Email });

                return Ok(new
                {
                    User = userDto,
                    Token = token
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
        [AllowAnonymous]
        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] CreateUserRequestDto input)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userDto = await _userService.Signup(input);

                var token = _userService.GenerateToken(new User { Id = userDto.Id, Email = userDto.Email });

                return Ok(new
                {
                    User = userDto,
                    Token = token
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet("getUser")]
        [Authorize]
        public async Task<IActionResult> GetUser()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var user = await _userService.GetUser(userId);
            if (user == null)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            // AutoMapper ile User => UserDto mapleme
            var userDto = _mapper.Map<UserDto>(user);

            // DTO içinde URL'yi tamamlıyoruz
            //userDto.ProfilePictureUrl = user.ProfilePicturePath != null
            //    ? $"{baseUrl}/uploads/{user.ProfilePicturePath}"
            //    : null;

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
        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId != null)
            {
                // Burada refresh token veya session silme işlemleri yapılabilir
                // Örneğin: await _authService.RemoveRefreshToken(userId);
            }
            return Ok(new { message = "Çıkış yapıldı." });
        }

    }
}
