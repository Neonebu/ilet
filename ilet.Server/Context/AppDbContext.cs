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
    }
}
