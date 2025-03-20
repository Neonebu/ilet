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
                .ForMember(dest => dest.ProfilePictureUrl, opt => opt.Ignore()); // BaseUrl için manuel ekleyeceğiz.
            CreateMap<CreateUserDto, User>();
            CreateMap<UpdateUserDto, User>();
        }
    }

}
