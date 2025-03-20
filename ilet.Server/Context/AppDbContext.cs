using ilet.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace ilet.Server.Context
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }

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
            return string.Concat(
                input.Select((x, i) => i > 0 && char.IsUpper(x) ? "_" + x : x.ToString())
            ).ToLower();
        }
    }
}
