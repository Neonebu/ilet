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

    public virtual UserProfilePictures? UserProfilePictures { get; set; }
}
