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
    [Route("user")]
    public class UserController : ControllerBase
    {
        private readonly IUsersService _userService;
        private readonly IWebHostEnvironment _env;
        private readonly IMapper _mapper;
        private readonly ILogger<UserController> _logger;
        public UserController(IUsersService userService, IWebHostEnvironment env,IMapper mapper, ILogger<UserController> logger)
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
                var token = _userService.GenerateToken(new Users { Id = userDto.Id, Email = userDto.Email });

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

                var token = _userService.GenerateToken(new Users { Id = userDto.Id, Email = userDto.Email });

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
        public async Task<IActionResult> Logout()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdStr != null && int.TryParse(userIdStr, out var userId))
            {
                await _userService.Logout(userId); // Redis'ten çıkar
            }

            return Ok(new { message = "Çıkış yapıldı." });
        }

        [HttpGet("profile-picture")]
        public async Task<IActionResult> GetProfilePicture()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
                return Unauthorized();

            var pp = await _userService.GetProfilePictureAsync(userId);
            if (pp == null)
                return NotFound();

            return File(pp.Image, pp.ContentType);
        }
        [HttpGet("getOnlineUsers")]
        [Authorize]
        public async Task<IActionResult> GetOnlineUsers()
        {
            var users = await _userService.GetOnlineUsers();
            return Ok(users);
        }
        [HttpGet("getOfflineUsers")]
        [Authorize]
        public async Task<IActionResult> GetOfflineUsers()
        {
            var users = await _userService.GetOnlineUsers();
            return Ok(users);
        }
        [HttpGet("getAllUsers")]
        [Authorize]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAll(); // mevcut metodunu çağırıyoruz
            var userDtos = _mapper.Map<List<UserDto>>(users);
            return Ok(userDtos);
        }
        [HttpPost("changeStatus")]
        [Authorize]
        public async Task<IActionResult> ChangeStatus([FromBody] ChangeStatusDto input)
        {
            var userId = int.Parse(User.FindFirst("nameid")!.Value);
            await _userService.ChangeStatus(userId, input.Status);
            return Ok(new { message = "Status updated" });
        }

    }
}
