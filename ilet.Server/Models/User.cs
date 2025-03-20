using System.ComponentModel.DataAnnotations.Schema;

namespace ilet.Server.Models
{
    public class User
    {
        public int Id { get; set; }
        public string? Nickname { get; set; } // nullable olabilir
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        [Column("profilepicturepath")]
        public string? ProfilePicturePath { get; set; }
        [Column("status")]
        public string? Status { get; set; }


    }
}
