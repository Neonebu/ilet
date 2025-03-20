using ilet.Server.Models;

namespace ilet.Server.Interfaces
{
    public interface IUserService
    {
        Task<List<User>> GetAll();
        Task<bool> UpdateProfilePicture(string userId, string fileName);
        Task<(bool success, string token, string nickname)> CreateOrGetUser(User user);
        Task<(bool success, User? user)> GetUser(string token);
        string GenerateToken(User user);
        Task<User?> GetUserById(string userId);
    }
}
