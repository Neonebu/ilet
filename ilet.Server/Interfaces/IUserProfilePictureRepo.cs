using ilet.Server.Models;

namespace ilet.Server.Interfaces
{
    public interface IUserProfilePictureRepo : IUserRepo<UserProfilePicture>
    {
        Task<UserProfilePicture?> GetByUserIdAsync(int userId);
    }

}
