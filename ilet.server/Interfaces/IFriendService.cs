using ilet.server.Dtos;

namespace ilet.server.Interfaces
{
    public interface IFriendService
    {
        Task AddFriendAsync(int requesterId, int addresseeId);
        Task<List<object>> GetFriendRequests(int userId);
        Task<string> RespondToFriendRequest(int userId, RespondFriendRequestDto dto);
        Task<string> RemoveFriend(int userId, int friendId);
    }
}
