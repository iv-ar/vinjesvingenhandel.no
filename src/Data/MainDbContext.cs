using Microsoft.EntityFrameworkCore;
using VSH.Data.Database;

namespace VSH.Data;

public class MainDbContext : DbContext
{
	public MainDbContext(DbContextOptions<MainDbContext> options) : base(options) { }

	public DbSet<User> Users { get; set; }
	public DbSet<Category> Categories { get; set; }
	public DbSet<Product> Products { get; set; }
	public DbSet<Order> Orders { get; set; }
	public DbSet<Document> Documents { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder) {
		modelBuilder.Entity<User>(e => {
			e.ToTable("Users");
		});
		modelBuilder.Entity<Category>(e => {
			e.ToTable("Categories");
		});
		modelBuilder.Entity<Order>(e => {
			e.Property(c => c.Products).HasColumnType("jsonb");
			e.Property(c => c.ContactInfo).HasColumnType("jsonb");
			e.ToTable("Orders");
		});

		modelBuilder.Entity<Product>(e => {
			e.Property(c => c.Images).HasColumnType("jsonb");
			e.ToTable("Products");
		});

		modelBuilder.Entity<Document>(e => {
			e.ToTable("Documents");
		});

		base.OnModelCreating(modelBuilder);
	}
}