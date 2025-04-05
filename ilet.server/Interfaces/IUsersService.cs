using ilet.server.Dtos;
using ilet.server.Models;

namespace ilet.server.Interfaces
{
    public interface IUsersService
    {
        Task<List<Users>> GetAll();
        Task<UserDto> Signup(CreateUserRequestDto input);
        Task<UserDto> Login(LoginRequestDto input);
        Task<UserDto?> GetUser(int userId);
        string GenerateToken(Users user);
        Task UploadProfilePicture(UserProfilePictureDto userProfilePictureDto);
        Task<bool> UpdateUserAsync(int userId, UpdateUserDto dto);
        Task<UserProfilePictureDto?> GetProfilePictureAsync(int userId);
        Task Logout(int userId);
        Task ChangeStatus(UserDto userDto);

    }
}
