using System.ComponentModel.DataAnnotations;

namespace ilet.Server.Dtos
{
    public class CreateUserRequestDto
    {
        public string Language { get; set; } = "en"; // Default 'en'
        public string? Nickname { get; set; }
        [Required]
        public required string Email { get; set; }
        [Required]
        public required string Password { get; set; }
    }
}
