using System;
using System.Collections.Generic;

namespace ilet.Server.Models;

public partial class UserProfilePictures
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public byte[] Image { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual Users User { get; set; } = null!;
}
