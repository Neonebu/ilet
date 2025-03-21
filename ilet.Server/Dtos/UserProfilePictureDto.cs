namespace ilet.Server.Dtos
{
    public class UserProfilePictureDto
    {
        public required byte[] Image { get; set; }
        public required string ContentType { get; set; }
    }

}
