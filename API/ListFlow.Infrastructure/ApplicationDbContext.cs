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
    public DbSet<ListingMetric> ListingMetrics { get; set; }
    public DbSet<Postage> Postages { get; set; }
    public DbSet<Images> Images { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MasterAccount>().ToTable("MasterAccount");
        modelBuilder.Entity<User>().ToTable("User");
        modelBuilder.Entity<LoginActivity>().ToTable("LoginActivity");
        modelBuilder.Entity<Inventory>().ToTable("Inventory");
        modelBuilder.Entity<SalesChannel>().ToTable("SalesChannel");
        modelBuilder.Entity<Listing>().ToTable("Listing");
        modelBuilder.Entity<ListingMetric>().ToTable("ListingMetric");
        modelBuilder.Entity<Postage>().ToTable("Postage");
        modelBuilder.Entity<Images>().ToTable("Images");
        
        modelBuilder.Entity<Listing>()
            .HasOne(l => l.SalesChannel)
            .WithMany()
            .HasForeignKey(l => l.SalesChannelId);
        
        modelBuilder.Entity<ListingMetric>()
            .HasOne(l => l.Listing)
            .WithMany()
            .HasForeignKey(l => l.ListingId);
    }
}
