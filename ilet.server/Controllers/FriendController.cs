using ilet.server.Dtos;
using ilet.server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ilet.server.Controllers
{
    [ApiController]
    [Route("friend")]
    public class FriendController : ControllerBase
    {
        private readonly IFriendService _friendService;

        public FriendController(IFriendService friendService)
        {
            _friendService = friendService;
        }
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("Test");
        }
        [HttpPost("add-friend")]
        public async Task<IActionResult> AddFriend([FromBody] AddFriendDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var requesterId))
                return Unauthorized();
            try
            {
                await _friendService.AddFriendAsync(requesterId, dto.Identifier);
                return Ok(new { message = "Friend request sent." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [Authorize]
        [HttpGet("requests")]
        public async Task<IActionResult> GetFriendRequests()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Unauthorized();
            var result = await _friendService.GetFriendRequests(userId);
            Console.WriteLine($"Friend requests for user {userId}: {result.Count} requests found."+ " useridstr: "+userIdStr);
            return Ok(result);
        }
        [HttpPost("respond")]
        public async Task<IActionResult> RespondToFriendRequest([FromBody] RespondFriendRequestDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Unauthorized();

            try
            {
                var message = await _friendService.RespondToFriendRequest(userId, dto);
                return Ok(new { message });
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
        [HttpPost("remove")]
        public async Task<IActionResult> RemoveFriend([FromBody] EmailDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest(new { message = "Email is required." });
            try
            {
                var result = await _friendService.RemoveFriend(userId, dto.Email);
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
        [HttpGet("all")]
        public async Task<IActionResult> GetAllFriends()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var friends = await _friendService.GetAllFriends(userId);
            return Ok(friends);
        }

    }
}
