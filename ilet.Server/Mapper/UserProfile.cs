using AutoMapper;
using ilet.Server.Dtos;
using ilet.Server.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;
namespace ilet.Server.Mapper
{
   public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.ProfilePictureUrl, opt => opt.Ignore()).ReverseMap(); // BaseUrl için manuel ekleyeceğiz.
            CreateMap<CreateUserRequestDto, User>();
            CreateMap<UpdateUserDto, User>();
            CreateMap<UserProfilePictureDto, UserProfilePicture>().ReverseMap();
        }
    }

}
