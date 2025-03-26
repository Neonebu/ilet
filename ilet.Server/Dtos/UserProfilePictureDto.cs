namespace ilet.Server.Dtos
{
    public class UserProfilePictureDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public required byte[] Image { get; set; }
        public required string ContentType { get; set; } // ekle
        public DateTime CreatedAt { get; set; }
    }

}
