using TenderPro.Domain.Entities;

namespace TenderPro.Application.DTOs;

public class TenderSummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string TenderNumber { get; set; } = string.Empty;
    public string IssuingAuthority { get; set; } = string.Empty;
    public string TenderType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string OverallComplexity { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public int RequirementCount { get; set; }
    public int DeadlineCount { get; set; }
    public int DocumentCount { get; set; }
    public int ChecklistCount { get; set; }
}

public class TenderDetailDto : TenderSummaryDto
{
    public string ExecutiveSummary { get; set; } = string.Empty;
    public string EligibilitySummary { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public List<RequirementDto> Requirements { get; set; } = [];
    public List<DeadlineDto> Deadlines { get; set; } = [];
    public List<RequiredDocumentDto> RequiredDocuments { get; set; } = [];
    public List<ChecklistItemDto> ChecklistItems { get; set; } = [];
}

public class RequirementDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PlainEnglish { get; set; } = string.Empty;
    public bool IsMandatory { get; set; }
    public int? SourcePage { get; set; }
    public string Category { get; set; } = string.Empty;
}

public class DeadlineDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime? DateTime { get; set; }
    public string DateTimeRaw { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsHardDeadline { get; set; }
    public int? DaysRemaining { get; set; }
}

public class RequiredDocumentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsMandatory { get; set; }
    public string AcceptedFormats { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

public class ChecklistItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public string Priority { get; set; } = string.Empty;
    public Guid? LinkedRequirementId { get; set; }
    public Guid? LinkedDeadlineId { get; set; }
}

public class ChecklistUpdateDto
{
    public bool IsCompleted { get; set; }
}
