using TenderPro.Application.DTOs;
using TenderPro.Application.Interfaces;
using TenderPro.Domain.Entities;

namespace TenderPro.Application.Services;

public class TenderProcessingService(
    ITenderRepository repository,
    IAiAnalysisService aiService,
    IFileStorageService fileStorage)
{
    public async Task<TenderDetailDto> ProcessUploadAsync(byte[] fileBytes, string fileName, string mimeType)
    {
        // 1. Create pending record
        var tender = new Tender
        {
            OriginalFileName = fileName,
            Title = Path.GetFileNameWithoutExtension(fileName),
            Status = TenderStatus.Processing
        };
        await repository.CreateAsync(tender);

        try
        {
            // 2. Save file to storage
            tender.StoragePath = await fileStorage.SaveFileAsync(fileBytes, fileName);

            // 3. Call AI analysis
            var result = await aiService.AnalyzeAsync(fileBytes, mimeType, fileName);

            // 4. Map AI result to entities
            tender.Title = !string.IsNullOrEmpty(result.NameOfWork)
                ? result.NameOfWork
                : Path.GetFileNameWithoutExtension(fileName);
            tender.TenderNumber = result.TenderNoticeNo;
            tender.IssuingAuthority = result.Issuer;
            tender.ExecutiveSummary = result.ExecutiveSummary;
            tender.EligibilitySummary = result.EligibilitySummary;
            tender.TenderType = ParseTenderType(result.TenderType);
            tender.OverallComplexity = ParseComplexity(result.OverallComplexity);

            if (decimal.TryParse(result.EstimatedValue?.Replace(",", "").Replace("₹", "").Trim(), out var val))
                tender.EstimatedValue = val;

            // Requirements
            foreach (var item in result.Eligibility)
            {
                tender.Requirements.Add(new Requirement
                {
                    TenderId = tender.Id,
                    Type = RequirementType.Eligibility,
                    Title = item.Title,
                    Description = item.Description,
                    PlainEnglish = item.Description,
                    IsMandatory = item.IsMandatory,
                    Category = item.Category
                });
            }

            // Deadlines
            foreach (var d in result.Deadlines)
            {
                DateTime.TryParse(d.Date, out var parsedDate);
                tender.Deadlines.Add(new Deadline
                {
                    TenderId = tender.Id,
                    Title = d.Event,
                    DateTimeRaw = d.Date,
                    DateTime = parsedDate == default ? null : DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc),
                    IsHardDeadline = d.IsHardDeadline
                });
            }

            // Required Documents
            foreach (var doc in result.RequiredDocuments)
            {
                tender.RequiredDocuments.Add(new RequiredDocument
                {
                    TenderId = tender.Id,
                    Name = doc.Name,
                    Description = doc.Description,
                    IsMandatory = doc.IsMandatory,
                    AcceptedFormats = doc.AcceptedFormats
                });
            }

            // Checklist Items
            foreach (var item in result.ComplianceChecklist)
            {
                tender.ChecklistItems.Add(new ChecklistItem
                {
                    TenderId = tender.Id,
                    Title = item.Title,
                    Category = ParseChecklistCategory(item.Category),
                    Priority = ParsePriority(item.Priority)
                });
            }

            tender.Status = TenderStatus.Completed;
            tender.ProcessedAt = DateTime.UtcNow;
        }
        catch (Exception ex)
        {
            tender.Status = TenderStatus.Failed;
            tender.ErrorMessage = ex.Message;
        }

        await repository.SaveChangesAsync();

        return MapToDetail(tender);
    }

    public async Task<List<TenderSummaryDto>> GetAllAsync()
    {
        var tenders = await repository.GetAllAsync();
        return tenders.Select(MapToSummary).ToList();
    }

    public async Task<TenderDetailDto?> GetByIdAsync(Guid id)
    {
        var tender = await repository.GetByIdAsync(id);
        return tender == null ? null : MapToDetail(tender);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var tender = await repository.GetByIdAsync(id);
        if (tender == null) return false;
        if (!string.IsNullOrEmpty(tender.StoragePath))
            await fileStorage.DeleteFileAsync(tender.StoragePath);
        await repository.DeleteAsync(id);
        await repository.SaveChangesAsync();
        return true;
    }

    public async Task<ChecklistItemDto?> ToggleChecklistItemAsync(Guid id, bool isCompleted)
    {
        var item = await repository.GetChecklistItemAsync(id);
        if (item == null) return null;
        item.IsCompleted = isCompleted;
        await repository.UpdateChecklistItemAsync(item);
        await repository.SaveChangesAsync();
        return MapChecklistItem(item);
    }

    // ── Mapping helpers ─────────────────────────────────────────────────────

    private static TenderSummaryDto MapToSummary(Tender t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        TenderNumber = t.TenderNumber,
        IssuingAuthority = t.IssuingAuthority,
        TenderType = t.TenderType.ToString(),
        Status = t.Status.ToString(),
        OriginalFileName = t.OriginalFileName,
        OverallComplexity = t.OverallComplexity.ToString(),
        CreatedAt = t.CreatedAt,
        ProcessedAt = t.ProcessedAt,
        RequirementCount = t.Requirements.Count,
        DeadlineCount = t.Deadlines.Count,
        DocumentCount = t.RequiredDocuments.Count,
        ChecklistCount = t.ChecklistItems.Count
    };

    private static TenderDetailDto MapToDetail(Tender t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        TenderNumber = t.TenderNumber,
        IssuingAuthority = t.IssuingAuthority,
        TenderType = t.TenderType.ToString(),
        Status = t.Status.ToString(),
        OriginalFileName = t.OriginalFileName,
        OverallComplexity = t.OverallComplexity.ToString(),
        ExecutiveSummary = t.ExecutiveSummary,
        EligibilitySummary = t.EligibilitySummary,
        ErrorMessage = t.ErrorMessage,
        CreatedAt = t.CreatedAt,
        ProcessedAt = t.ProcessedAt,
        RequirementCount = t.Requirements.Count,
        DeadlineCount = t.Deadlines.Count,
        DocumentCount = t.RequiredDocuments.Count,
        ChecklistCount = t.ChecklistItems.Count,
        Requirements = t.Requirements.Select(r => new RequirementDto
        {
            Id = r.Id,
            Type = r.Type.ToString(),
            Title = r.Title,
            Description = r.Description,
            PlainEnglish = r.PlainEnglish,
            IsMandatory = r.IsMandatory,
            SourcePage = r.SourcePage,
            Category = r.Category
        }).ToList(),
        Deadlines = t.Deadlines.Select(d => new DeadlineDto
        {
            Id = d.Id,
            Title = d.Title,
            DateTime = d.DateTime,
            DateTimeRaw = d.DateTimeRaw,
            Description = d.Description,
            IsHardDeadline = d.IsHardDeadline,
            DaysRemaining = d.DaysRemaining
        }).ToList(),
        RequiredDocuments = t.RequiredDocuments.Select(d => new RequiredDocumentDto
        {
            Id = d.Id,
            Name = d.Name,
            Description = d.Description,
            IsMandatory = d.IsMandatory,
            AcceptedFormats = d.AcceptedFormats,
            Notes = d.Notes
        }).ToList(),
        ChecklistItems = t.ChecklistItems.Select(MapChecklistItem).ToList()
    };

    private static ChecklistItemDto MapChecklistItem(ChecklistItem c) => new()
    {
        Id = c.Id,
        Title = c.Title,
        Description = c.Description,
        Category = c.Category.ToString(),
        IsCompleted = c.IsCompleted,
        Priority = c.Priority.ToString(),
        LinkedRequirementId = c.LinkedRequirementId,
        LinkedDeadlineId = c.LinkedDeadlineId
    };

    private static TenderType ParseTenderType(string? val) => val?.ToLower() switch
    {
        "works" => TenderType.Works,
        "goods" => TenderType.Goods,
        "services" => TenderType.Services,
        "consultancy" => TenderType.Consultancy,
        _ => TenderType.Unknown
    };

    private static ComplexityLevel ParseComplexity(string? val) => val?.ToLower() switch
    {
        "low" => ComplexityLevel.Low,
        "high" => ComplexityLevel.High,
        _ => ComplexityLevel.Medium
    };

    private static ChecklistCategory ParseChecklistCategory(string? val) => val?.ToLower() switch
    {
        "documents" => ChecklistCategory.Documents,
        "eligibility" => ChecklistCategory.Eligibility,
        "technical" => ChecklistCategory.Technical,
        "submission" => ChecklistCategory.Submission,
        "financial" => ChecklistCategory.Financial,
        _ => ChecklistCategory.Other
    };

    private static ChecklistPriority ParsePriority(string? val) => val?.ToLower() switch
    {
        "high" => ChecklistPriority.High,
        "low" => ChecklistPriority.Low,
        _ => ChecklistPriority.Medium
    };
}
