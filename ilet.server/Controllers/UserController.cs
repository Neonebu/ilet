using AutoMapper;
using ilet.server.Dtos;
using ilet.server.Interfaces;
using ilet.server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ilet.server.Controllers
{
    [ApiController]
    [Route("user")]
    public class UserController(
    IUsersService userService,
    IWebHostEnvironment env,
    IMapper mapper,
    ILogger<UserController> logger
) : ControllerBase
    {
        private readonly IUsersService _userService = userService; 
        private readonly IWebHostEnvironment _env = env;
        private readonly IMapper _mapper = mapper;
        private readonly ILogger<UserController> _logger = logger;
        [HttpGet("index")]
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
                return BadRequest(new { ex.Message });
            }
        }
        [AllowAnonymous]
        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] CreateUserRequestDto input)
        {
            if (!ModelState.IsValid)
                return BadRequest("Modelstate valid değil "+ModelState);

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
            // AutoMapper ile User => UserDto mapleme
            var userDto = _mapper.Map<UserDto>(user);
            return Ok(userDto);
        }
        [HttpPost("uploadProfilePic")]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProfilePic([FromForm] UploadProfilePictureDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                return BadRequest(new { message = "Dosya seçilmedi." });

            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            try
            {
                await _userService.UploadProfilePictureAsync(dto, userId);
                return Ok(new { message = "Yükleme başarılı." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Profil resmi yüklenirken hata oluştu: " + ex.ToString());
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
        [Authorize]
        [HttpGet("getpp")]
        public async Task<IActionResult> GetProfilePicture()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId) || userId <= 0)
                return Unauthorized(new { message = "Yetkilendirme başarısız." });

            var pp = await _userService.GetProfilePictureAsync(userId);
            if (pp == null)
                return NoContent();

            return File(pp.Image, pp.ContentType);
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
            var email = User.FindFirst("email")?.Value ?? "unknown@example.com";
            var userDto = new UserDto
            {
                Id = userId,
                Status = input.Status,
                Email = email
            };
            await _userService.ChangeStatus(userDto);
            return Ok(new { message = "Status updated" });
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto input)
        {
            await _userService.SendPasswordReminderEmailAsync(input.Email);
            return Ok(new { message = "Eğer böyle bir hesap varsa şifre gönderildi." });
        }
        [AllowAnonymous]
        [HttpGet("getppbyid")]
        public async Task<IActionResult> GetProfilePictureById(int id)
        {
            var pp = await _userService.GetProfilePictureByIdAsync(id);
            if (pp?.Image == null || string.IsNullOrEmpty(pp.ContentType))
                return NoContent();
            return File(pp.Image, pp.ContentType);
        }
        [HttpDelete("deleteUser/{userId}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            var result = await _userService.DeleteUserAsync(userId);
            if (!result)
                return NotFound("User Not Found");

            return Ok("User Deleted");
        }

    }
}
