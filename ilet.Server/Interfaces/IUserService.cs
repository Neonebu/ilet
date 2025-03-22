using ilet.Server.Dtos;
using ilet.Server.Models;

namespace ilet.Server.Interfaces
{
    public interface IUserService
    {
        Task<List<User>> GetAll();
        Task<UserDto> Signup(CreateUserRequestDto input);
        Task<UserDto> Login(LoginRequestDto input);
        Task<UserDto?> GetUser(int userId);
        string GenerateToken(User user);
        Task UploadProfilePicture(int userId, IFormFile file);
        Task<bool> UpdateUserAsync(int userId, UpdateUserDto dto);
        Task<UserProfilePictureDto?> GetProfilePictureAsync(int userId);
    }
}
