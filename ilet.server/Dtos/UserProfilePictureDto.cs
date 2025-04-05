using Microsoft.AspNetCore.Mvc;

namespace ilet.server.Dtos
{
    public class UserProfilePictureDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public required byte[] Image { get; set; }
        public required string ContentType { get; set; } // ekle
        public DateTime CreatedAt { get; set; }
        [FromForm(Name = "profilePicture")]
        public required IFormFile File { get; set; }
    }

}
