using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace ilet.Server.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nickname")]
        public string? Nickname { get; set; }

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("password")]
        public string Password { get; set; } = string.Empty;

        [Column("profile_picture_path")]
        public string? ProfilePicturePath { get; set; }

        [Column("status")]
        public string? Status { get; set; }
        public string Language { get; set; } = "en"; // Default 'en'

    }

}
