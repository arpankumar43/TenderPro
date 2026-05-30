using Microsoft.EntityFrameworkCore;
using TenderPro.Application.Interfaces;
using TenderPro.Domain.Entities;
using TenderPro.Infrastructure.Data;

namespace TenderPro.Infrastructure.Data.Repositories;

public class TenderRepository(TenderProDbContext db) : ITenderRepository
{
    public async Task<Tender> CreateAsync(Tender tender)
    {
        db.Tenders.Add(tender);
        await db.SaveChangesAsync();
        return tender;
    }

    public async Task<Tender?> GetByIdAsync(Guid id)
        => await db.Tenders
            .Include(t => t.Requirements)
            .Include(t => t.Deadlines)
            .Include(t => t.RequiredDocuments)
            .Include(t => t.ChecklistItems)
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task<List<Tender>> GetAllAsync()
        => await db.Tenders
            .Include(t => t.Requirements)
            .Include(t => t.Deadlines)
            .Include(t => t.RequiredDocuments)
            .Include(t => t.ChecklistItems)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

    public async Task UpdateAsync(Tender tender)
    {
        var entry = db.Entry(tender);
        if (entry.State == EntityState.Detached)
        {
            db.Tenders.Update(tender);
        }
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var tender = await db.Tenders.FindAsync(id);
        if (tender != null) db.Tenders.Remove(tender);
    }

    public async Task<ChecklistItem?> GetChecklistItemAsync(Guid id)
        => await db.ChecklistItems.FindAsync(id);

    public async Task UpdateChecklistItemAsync(ChecklistItem item)
        => db.ChecklistItems.Update(item);

    public async Task SaveChangesAsync()
    {
        try
        {
            await db.SaveChangesAsync();
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException ex)
        {
            var msg = new System.Text.StringBuilder();
            msg.AppendLine("Concurrency Exception Entities:");
            foreach (var entry in db.ChangeTracker.Entries())
            {
                var idVal = entry.Metadata.FindProperty("Id") != null ? entry.Property("Id").CurrentValue : "N/A";
                msg.AppendLine($"- Entity: {entry.Entity.GetType().Name}, State: {entry.State}, Id: {idVal}");
            }
            throw new Exception(msg.ToString(), ex);
        }
    }
}
