namespace ilet.server.Services
{
    using ilet.server.Dtos;
    using ilet.server.Interfaces;
    using ilet.server.Models;
    using Microsoft.EntityFrameworkCore;

    public class FriendService : IFriendService
    {
        private readonly IRepositoryDb<Userfriendship> _userFriendshipRepo;
        private readonly IRepositoryDb<Users> _userRepo;

        public FriendService(IRepositoryDb<Userfriendship> userFriendshipRepo, IRepositoryDb<Users> userRepo)
        {
            _userFriendshipRepo = userFriendshipRepo;
            _userRepo = userRepo;
        }

        public async Task AddFriendAsync(int requesterId, int addresseeId)
        {
            var exists = await _userFriendshipRepo.AnyAsync(f => f.Requesterid == requesterId && f.Addresseeid == addresseeId);

            if (!exists)
            {
                var friendship = new Userfriendship
                {
                    Requesterid = requesterId,
                    Addresseeid = addresseeId,
                    Status = 0 // Pending
                };

                await _userFriendshipRepo.AddAsync(friendship);
                await _userFriendshipRepo.SaveAsync();
            }
        }

        public async Task<List<object>> GetFriendRequests(int userId)
        {
            var requests = await _userFriendshipRepo
                .Query()
                .Include(f => f.Requester)
                .Where(f => f.Addresseeid == userId && f.Status == 0)
                .Select(f => new {
                    f.Id,
                    RequesterId = f.Requesterid,
                    RequesterNickname = f.Requester.Nickname
                })
                .ToListAsync();

            return requests.Cast<object>().ToList();
        }

        public async Task<string> RespondToFriendRequest(int userId, RespondFriendRequestDto dto)
        {
            var friendship = await _userFriendshipRepo
                .FirstOrDefaultAsync(f => f.Id == dto.FriendshipId && f.Addresseeid == userId);

            if (friendship == null)
                throw new Exception("Friend request not found.");

            friendship.Status = dto.Accept ? 1 : 2;
            await _userFriendshipRepo.SaveAsync();

            return dto.Accept ? "Friend request accepted." : "Friend request declined.";
        }
        public async Task<string> RemoveFriend(int requesterId, string email)
        {
            // Find the user to be removed by email
            var friendUser = await _userRepo.Query().FirstOrDefaultAsync(u => u.Email == email);
            if (friendUser == null)
                throw new KeyNotFoundException("User not found.");

            // Look for an existing friendship record (both directions are considered)
            var friendship = await _userFriendshipRepo.Query()
                .FirstOrDefaultAsync(f =>
                    (f.Requesterid == requesterId && f.Addresseeid == friendUser.Id) ||
                    (f.Requesterid == friendUser.Id && f.Addresseeid == requesterId)
                );

            if (friendship == null)
                throw new KeyNotFoundException("Friendship not found.");

            // Delete the friendship record
            _userFriendshipRepo.Delete(friendship);
            await _userFriendshipRepo.SaveAsync();

            // Return a specific message if the user is removing themselves
            return friendUser.Id == requesterId
                ? "Self-friendship removed."
                : "Friend removed successfully.";
        }

    }
}
