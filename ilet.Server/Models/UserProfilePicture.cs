namespace ilet.Server.Models
{
    public class UserProfilePicture
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public byte[]? Image { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
