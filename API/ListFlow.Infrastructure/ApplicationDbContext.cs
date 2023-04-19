namespace ListFlow.Infrastructure;

using ListFlow.Domain.Model;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<MasterAccount> MasterAccounts { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<LoginActivity> LoginActivities { get; set; }
    public DbSet<Inventory> Inventories { get; set; }
    public DbSet<SalesChannel> SalesChannels { get; set; }
    public DbSet<Listing> Listings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MasterAccount>().ToTable("MasterAccount");
        modelBuilder.Entity<User>().ToTable("User");
        modelBuilder.Entity<LoginActivity>().ToTable("LoginActivity");
        modelBuilder.Entity<Inventory>().ToTable("Inventory");
        modelBuilder.Entity<SalesChannel>().ToTable("SalesChannel");
        modelBuilder.Entity<Listing>().ToTable("Listing");
    }
}
