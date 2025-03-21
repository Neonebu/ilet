using ilet.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace ilet.Server.Context
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<UserProfilePicture> UserProfilePictures { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                // Tablo ismini snake_case yap
                entity.SetTableName(ToSnakeCase(entity.GetTableName()!));

                // Kolonları snake_case yap
                foreach (var property in entity.GetProperties())
                {
                    property.SetColumnName(ToSnakeCase(property.Name));
                }
            }
        }
        private static string ToSnakeCase(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return input;

            return System.Text.RegularExpressions.Regex
                .Replace(input, @"([a-z0-9])([A-Z])", "$1_$2")
                .Replace("-", "_")
                .ToLower();
        }

    }
}
