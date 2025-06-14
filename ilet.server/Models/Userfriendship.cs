using System;
using System.Collections.Generic;

namespace ilet.server.Models;

public partial class Userfriendship
{
    public int Id { get; set; }

    public int Requesterid { get; set; }

    public int Addresseeid { get; set; }

    public int Status { get; set; }

    public DateTime? Createdat { get; set; }
    public virtual Users Requester { get; set; } = null!;
    public virtual Users Addressee { get; set; } = null!;

}
