namespace ilet.server.Services
{
    using ilet.server.Context;
    using ilet.server.Dtos;
    using ilet.server.Interfaces;
    using ilet.server.Models;
    using Microsoft.EntityFrameworkCore;

    public class FriendService : IFriendService
    {
        private readonly AppDbContext _context;

        public FriendService(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddFriendAsync(int requesterId, int addresseeId)
        {
            var exists = await _context.Userfriendships
                .AnyAsync(f => f.Requesterid == requesterId && f.Addresseeid == addresseeId);

            if (!exists)
            {
                var friendship = new Userfriendship
                {
                    Requesterid = requesterId,
                    Addresseeid = addresseeId,
                    Status = 0 // Pending
                };

                _context.Userfriendships.Add(friendship);
                await _context.SaveChangesAsync();
            }
        }
        public async Task<List<object>> GetFriendRequests(int userId)
        {
            var requests = await _context.Userfriendships
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
            var friendship = await _context.Userfriendships
                .FirstOrDefaultAsync(f => f.Id == dto.FriendshipId && f.Addresseeid == userId);

            if (friendship == null)
                throw new Exception("Arkadaşlık isteği bulunamadı.");

            friendship.Status = dto.Accept ? 1 : 2;
            await _context.SaveChangesAsync();

            return dto.Accept ? "Arkadaşlık kabul edildi" : "İstek reddedildi";
        }
        public async Task<string> RemoveFriend(int userId, int friendId)
        {
            var friendship = await _context.Userfriendships
                .FirstOrDefaultAsync(f =>
                    (f.Requesterid == userId && f.Addresseeid == friendId) ||
                    (f.Requesterid == userId && f.Addresseeid == friendId));

            if (friendship == null)
                throw new Exception("Arkadaşlık bulunamadı.");

            _context.Userfriendships.Remove(friendship);
            await _context.SaveChangesAsync();

            return "Arkadaş silindi.";
        }
    }

}
