using AutoMapper;
using ilet.server.Dtos;
using ilet.server.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;
namespace ilet.server.Mapper
{
   public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<Users, UserDto>()
                .ForMember(dest => dest.ProfilePictureUrl, opt => opt.Ignore()).ReverseMap(); // BaseUrl için manuel ekleyeceğiz.
            CreateMap<CreateUserRequestDto, Users>();
            CreateMap<UpdateUserDto, Users>();
            CreateMap<UserProfilePictureDto, UserProfilePictures>().ReverseMap();
        }
    }

}
