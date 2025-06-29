using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using ilet.server.Models;

namespace ilet.server.Context;

public partial class AppDbContext : DbContext
{
    public AppDbContext() { }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public virtual DbSet<Userfriendship> Userfriendships { get; set; }
    public virtual DbSet<Users> Users { get; set; }
    public virtual DbSet<UserProfilePictures> UserProfilePictures { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder
            .UseNpgsql("Host=dpg-cvc71llds78s73ag5g9g-a.oregon-postgres.render.com;Port=5432;Database=iletapi_db;Username=iletapi_db_user;Password=9FDT9Cv3POHCkXRmDWRAcSekKssHYdQG;Ssl Mode=Require;Trust Server Certificate=true;")
            .ConfigureWarnings(x => x.Ignore(RelationalEventId.PendingModelChangesWarning));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Userfriendship>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("userfriendships_pkey");

            entity.ToTable("userfriendships");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Addresseeid).HasColumnName("addresseeid");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("createdat");
            entity.Property(e => e.Requesterid).HasColumnName("requesterid");
            entity.Property(e => e.Status).HasColumnName("status");
        });

        modelBuilder.Entity<Users>(entity =>
        {
            entity.ToTable("users");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.Language).HasColumnName("language");
            entity.Property(e => e.Nickname).HasColumnName("nickname");
            entity.Property(e => e.Password).HasColumnName("password");
            entity.Property(e => e.Status).HasColumnName("status");
        });
        modelBuilder.Entity<Userfriendship>()
        .HasOne(uf => uf.Requester)
        .WithMany(u => u.SentFriendRequests)
        .HasForeignKey(uf => uf.Requesterid)
        .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Userfriendship>()
            .HasOne(uf => uf.Addressee)
            .WithMany(u => u.ReceivedFriendRequests)
            .HasForeignKey(uf => uf.Addresseeid)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<UserProfilePictures>(entity =>
        {
            entity.ToTable("user_profile_pictures");

            entity.HasKey(e => e.Id).HasName("userprofilepictures_pkey");

            entity.HasIndex(e => e.UserId, "uq_user_profile_pictures_user_id").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("nextval('userprofilepictures_id_seq'::regclass)")
                .HasColumnName("id");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");

            entity.Property(e => e.Image).HasColumnName("image");

            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.Property(e => e.ContentType).HasColumnName("content_type"); // 🔥 Eksik olan bu!

            entity.HasOne(d => d.User).WithOne(p => p.UserProfilePictures)
                .HasForeignKey<UserProfilePictures>(d => d.UserId)
                .HasConstraintName("fk_user_profile_pictures_user");
        });


        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}