using TenderPro.Application.DTOs;
using TenderPro.Domain.Entities;

namespace TenderPro.Application.Interfaces;

public interface ITenderRepository
{
    Task<Tender> CreateAsync(Tender tender);
    Task<Tender?> GetByIdAsync(Guid id);
    Task<List<Tender>> GetAllAsync();
    Task UpdateAsync(Tender tender);
    Task DeleteAsync(Guid id);
    Task<ChecklistItem?> GetChecklistItemAsync(Guid id);
    Task UpdateChecklistItemAsync(ChecklistItem item);
    Task SaveChangesAsync();
}
