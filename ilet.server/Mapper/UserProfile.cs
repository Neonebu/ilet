using AutoMapper;
using ilet.server.Dtos;
using ilet.server.Models;
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
            CreateMap<UserProfilePictures, UserProfilePictureDto>();
            CreateMap<UserProfilePictureDto, UserProfilePictures>();
        }
    }
}