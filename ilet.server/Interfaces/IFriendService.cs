using ilet.server.Dtos;

namespace ilet.server.Interfaces
{
    public interface IFriendService
    {
        Task AddFriendAsync(int requesterId, string identifier);
        Task<List<FriendRequestDto>> GetFriendRequests(int userId);
        Task<string> RespondToFriendRequest(int userId, RespondFriendRequestDto dto);

        // Yeni: friendId veya identifier parametrelerinden biriyle silme
        Task<string> RemoveFriend(int requesterId, string email); // ✅ Yeni hali sadece requesterId ve email alır
        Task<List<UserSummaryDto>> GetAllFriends(int userId);
    }
}
