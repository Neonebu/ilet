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
        public async Task AddFriendAsync(int requesterId, string identifier)
        {
            var friendUser = await _userRepo.Query()
                .FirstOrDefaultAsync(u => u.Email == identifier || u.Nickname == identifier);

            if (friendUser == null)
                throw new Exception($"User with identifier '{identifier}' not found.");

            if (string.IsNullOrWhiteSpace(identifier))
                throw new Exception("Identifier (email or nickname) is required.");
            // Allow self-add, but prevent duplicates
            var alreadyExists = await _userFriendshipRepo.Query()
                .AnyAsync(f =>
                    f.Requesterid == requesterId &&
                    f.Addresseeid == friendUser.Id);
            var alreadyExistsReverse = await _userFriendshipRepo.Query()
            .AnyAsync(f => f.Requesterid == friendUser.Id && f.Addresseeid == requesterId);

            if (alreadyExists || alreadyExistsReverse)
                throw new Exception("Friendship already exists or a request has already been sent.");

            var friendship = new Userfriendship
            {
                Requesterid = requesterId,
                Addresseeid = friendUser.Id,
                Status =  0, // always pending, even if self
                Createdat = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
            };

            await _userFriendshipRepo.AddAsync(friendship);
            await _userFriendshipRepo.SaveAsync();
        }
        public async Task<List<FriendRequestDto>> GetFriendRequests(int userId)
        {
            var requests = await _userFriendshipRepo
                .Query()
                //.Include(f => f.Requester)
                .Where(f => f.Addresseeid == userId)
                .Select(f => new FriendRequestDto
                {
                    Id = f.Id,
                    RequesterId = f.Requesterid,
                    RequesterNickname = f.Requester != null ? f.Requester.Nickname : "(Unknown)",
                    Status = f.Status // ← burada da ekle
                })
                .ToListAsync();
            return requests;
        }
        public async Task<string> RespondToFriendRequest(int userId, RespondFriendRequestDto dto)
        {
            var friendship = await _userFriendshipRepo
                .FirstOrDefaultAsync(f => f.Id == dto.FriendshipId && f.Addresseeid == userId);

            if (friendship == null)
                throw new Exception("Friend request not found.");

            friendship.Status = dto.Accept ? 1 : 2;
            if (dto.Accept)
            {
                // Eğer ters yönlü kayıt varsa, onu da güncelle
                var reverse = await _userFriendshipRepo
                    .FirstOrDefaultAsync(f =>
                        f.Requesterid == userId &&
                        f.Addresseeid == friendship.Requesterid &&
                        f.Status == 0);

                if (reverse != null)
                {
                    reverse.Status = 1;
                }
            }
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
        public async Task<List<UserSummaryDto>> GetAllFriends(int userId)
        {
            var friendships = await _userFriendshipRepo.Query()
                .Where(f =>
                    f.Status == 1 &&
                    (f.Requesterid == userId || f.Addresseeid == userId))
                .ToListAsync();

            var friendIds = friendships
                .Select(f => f.Requesterid == userId ? f.Addresseeid : f.Requesterid)
                .Distinct()
                .ToList();

            var users = await _userRepo.Query()
                .Where(u => friendIds.Contains(u.Id))
                .Select(u => new UserSummaryDto
                {
                    Id = u.Id,
                    Nickname = u.Nickname,
                    Status = u.Status,
                    Email = u.Email // 🔧 bunu ekle
                })
                .ToListAsync();

            return users;
        }
    }
}
