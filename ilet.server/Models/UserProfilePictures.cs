using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ilet.server.Models;

public partial class UserProfilePictures
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public byte[]? Image { get; set; } = null!;
    [Column(TypeName = "timestamp with time zone")]
    public DateTime? CreatedAt { get; set; }
    [Column("content_type")] // Veritabanındaki isimle eşleştir
    public required string ContentType { get; set; } // ekle
    public virtual Users User { get; set; } = null!;
}
