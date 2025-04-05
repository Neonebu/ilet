using System;
using System.Collections.Generic;

namespace ilet.server.Models;

public partial class Users
{
    public int Id { get; set; }

    public string? Nickname { get; set; }

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string? Status { get; set; }

    public string Language { get; set; } = "en";

    public virtual UserProfilePictures? UserProfilePictures { get; set; }
}
