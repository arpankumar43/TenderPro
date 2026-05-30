using Microsoft.EntityFrameworkCore;
using TenderPro.Domain.Entities;

namespace TenderPro.Infrastructure.Data;

public class TenderProDbContext(DbContextOptions<TenderProDbContext> options) : DbContext(options)
{
    public DbSet<Tender> Tenders => Set<Tender>();
    public DbSet<Requirement> Requirements => Set<Requirement>();
    public DbSet<Deadline> Deadlines => Set<Deadline>();
    public DbSet<RequiredDocument> RequiredDocuments => Set<RequiredDocument>();
    public DbSet<ChecklistItem> ChecklistItems => Set<ChecklistItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Tender>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Title).HasMaxLength(500);
            e.Property(t => t.TenderNumber).HasMaxLength(100);
            e.Property(t => t.IssuingAuthority).HasMaxLength(300);
            e.Property(t => t.Currency).HasMaxLength(10);
            e.Property(t => t.OriginalFileName).HasMaxLength(255);
            e.Property(t => t.Status).HasConversion<string>();
            e.Property(t => t.TenderType).HasConversion<string>();
            e.Property(t => t.OverallComplexity).HasConversion<string>();

            e.HasMany(t => t.Requirements).WithOne(r => r.Tender).HasForeignKey(r => r.TenderId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(t => t.Deadlines).WithOne(d => d.Tender).HasForeignKey(d => d.TenderId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(t => t.RequiredDocuments).WithOne(d => d.Tender).HasForeignKey(d => d.TenderId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(t => t.ChecklistItems).WithOne(c => c.Tender).HasForeignKey(c => c.TenderId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Requirement>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Type).HasConversion<string>();
            e.Property(r => r.Title).HasMaxLength(500);
            e.Property(r => r.Category).HasMaxLength(100);
        });

        modelBuilder.Entity<Deadline>(e =>
        {
            e.HasKey(d => d.Id);
            e.Property(d => d.Title).HasMaxLength(300);
            e.Ignore(d => d.DaysRemaining); // computed property
        });

        modelBuilder.Entity<RequiredDocument>(e =>
        {
            e.HasKey(d => d.Id);
            e.Property(d => d.Name).HasMaxLength(300);
            e.Property(d => d.AcceptedFormats).HasMaxLength(200);
        });

        modelBuilder.Entity<ChecklistItem>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Category).HasConversion<string>();
            e.Property(c => c.Priority).HasConversion<string>();
            e.Property(c => c.Title).HasMaxLength(500);
            e.HasOne(c => c.LinkedRequirement).WithMany().HasForeignKey(c => c.LinkedRequirementId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(c => c.LinkedDeadline).WithMany().HasForeignKey(c => c.LinkedDeadlineId).OnDelete(DeleteBehavior.SetNull);
        });
    }
}
