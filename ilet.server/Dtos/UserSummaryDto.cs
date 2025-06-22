namespace ilet.server.Dtos
{
    public class UserSummaryDto
    {
        public int Id { get; set; }
        public string? Nickname { get; set; }
        public required string Email { get; set; }
        public string? Status { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }
}
