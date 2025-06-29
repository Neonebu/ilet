using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ilet.server.Models;
[Table("users")]
public partial class Users
{
    [Column("id")]
    public int Id { get; set; }

    [Column("nickname")]
    public string? Nickname { get; set; }

    [Column("email")]
    public string Email { get; set; } = null!;

    [Column("password")]
    public string Password { get; set; } = null!;

    [Column("status")]
    public string? Status { get; set; }

    [Column("language")]
    public string Language { get; set; } = "en";

    [Column("isworldvisible")]
    public bool IsWorldVisible { get; set; } = false;

    public virtual UserProfilePictures? UserProfilePictures { get; set; }

    // 🔽 Bunlar eklenmeli
    public virtual ICollection<Userfriendship> SentFriendRequests { get; set; } = new List<Userfriendship>();
    public virtual ICollection<Userfriendship> ReceivedFriendRequests { get; set; } = new List<Userfriendship>();
}
