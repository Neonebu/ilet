using ilet.Server.Context;
using ilet.Server.Interfaces;
using ilet.Server.Models;
using IletApi.Repo;

namespace ilet.Server.Repository
{
    public class UserProfilePictureRepo : UserRepo<UserProfilePicture>, IUserProfilePictureRepo
    {
        private readonly AppDbContext _context;

        public UserProfilePictureRepo(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<UserProfilePicture?> GetByUserIdAsync(int userId)
        {
            return await FirstOrDefaultAsync(x => x.UserId == userId);
        }
    }


}
