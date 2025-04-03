namespace ilet.Server.Dtos
{
    public class UpdateUserDto
    {
        public required string Email { get; set; }
        public string? Nickname { get; set; }
        public string? Status { get; set; }
        public string? Language { get; set; }

    }
}
