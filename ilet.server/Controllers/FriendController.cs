using ilet.server.Dtos;
using ilet.server.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ilet.server.Controllers
{
    [ApiController]
    [Route("friends")]
    public class FriendController : ControllerBase
    {
        private readonly IFriendService _friendService;

        public FriendController(IFriendService friendService)
        {
            _friendService = friendService;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddFriend([FromBody] AddFriendDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var requesterId))
                return Unauthorized();

            await _friendService.AddFriendAsync(requesterId, dto.AddresseeId);
            return Ok(new { message = "Arkadaşlık isteği gönderildi." });
        }

        [HttpGet("requests")]
        public async Task<IActionResult> GetFriendRequests()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var result = await _friendService.GetFriendRequests(userId);
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

        [HttpDelete("remove/{friendId}")]
        public async Task<IActionResult> RemoveFriend(int friendId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Unauthorized();

            try
            {
                var message = await _friendService.RemoveFriend(userId, friendId);
                return Ok(new { message });
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
