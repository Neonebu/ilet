using ilet.Server.Models;

namespace ilet.Server.Interfaces
{
    public interface IUserService
    {
        List<User> GetAll();
        bool UpdateProfilePicture(string userId, string fileName);
        (bool success, string token, string nickname) CreateOrGetUser(User user);
        (bool success, User user) GetUser(string token);
        string GenerateToken(User user);
        User GetUserById(string userId);
    }
}
