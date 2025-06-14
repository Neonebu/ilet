using Microsoft.AspNetCore.Mvc;

namespace ilet.server.Dtos
{
    public class UserProfilePictureDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public byte[] Image { get; set; } = null!;
        public string ContentType { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
    public class UploadProfilePictureDto
    {
        [FromForm(Name = "profilePicture")]
        public required IFormFile File { get; set; }
    }
}
