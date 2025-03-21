using ilet.Server.Dtos;
using ilet.Server.Models;

namespace ilet.Server.Interfaces
{
    public interface IUserService
    {
        Task<List<User>> GetAll();
        Task<(bool success, string token, string nickname)> CreateOrGetUser(User user);
        Task<(bool success, User? user)> GetUser(string token);
        string GenerateToken(User user);
        Task<User?> GetUserById(int userId);
        Task<bool> CreateUserAsync(CreateUserDto dto);
        Task<bool> UpdateUserAsync(int userId, UpdateUserDto dto);
        Task UploadProfilePicture(int userId, IFormFile file);
    }
}
