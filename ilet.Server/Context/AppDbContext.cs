using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using ilet.Server.Models;

namespace ilet.Server.Context;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<UserProfilePictures> UserProfilePictures { get; set; }

    public virtual DbSet<Users> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=dpg-cvc71llds78s73ag5g9g-a.oregon-postgres.render.com;Port=5432;Database=iletapi_db;Username=iletapi_db_user;Password=9FDT9Cv3POHCkXRmDWRAcSekKssHYdQG;Ssl Mode=Require;Trust Server Certificate=true;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserProfilePictures>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("userprofilepictures_pkey");

            entity.ToTable("user_profile_pictures");

            entity.HasIndex(e => e.UserId, "uq_user_profile_pictures_user_id").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("nextval('userprofilepictures_id_seq'::regclass)")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Image).HasColumnName("image");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithOne(p => p.UserProfilePictures)
                .HasForeignKey<UserProfilePictures>(d => d.UserId)
                .HasConstraintName("fk_user_profile_pictures_user");
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

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
