using Appsilon.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Appsilon.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<CameraLog> CameraLogs => Set<CameraLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.ToTable("employees");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name)
                  .IsRequired();
            entity.Property(e => e.Department)
                  .IsRequired();
            entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<CameraLog>(entity =>
        {
            entity.ToTable("camera_logs");
            entity.HasKey(c => c.Id);
            entity.Property(c => c.ImageUrl)
                  .IsRequired();
            entity.Property(c => c.ModelOutputJson)
                  .IsRequired();
            entity.Property(c => c.CreatedAt)
                  .HasDefaultValueSql("now()");
        });
    }
}
