namespace TenderPro.Domain.Entities;

public enum TenderStatus { Pending, Processing, Completed, Failed }
public enum TenderType { Works, Goods, Services, Consultancy, Unknown }
public enum ComplexityLevel { Low, Medium, High }

public class Tender
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string TenderNumber { get; set; } = string.Empty;
    public string IssuingAuthority { get; set; } = string.Empty;
    public TenderType TenderType { get; set; } = TenderType.Unknown;
    public decimal? EstimatedValue { get; set; }
    public string Currency { get; set; } = "INR";
    public TenderStatus Status { get; set; } = TenderStatus.Pending;
    public string OriginalFileName { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public string ExecutiveSummary { get; set; } = string.Empty;
    public string EligibilitySummary { get; set; } = string.Empty;
    public ComplexityLevel OverallComplexity { get; set; } = ComplexityLevel.Medium;
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }

    public List<Requirement> Requirements { get; set; } = [];
    public List<Deadline> Deadlines { get; set; } = [];
    public List<RequiredDocument> RequiredDocuments { get; set; } = [];
    public List<ChecklistItem> ChecklistItems { get; set; } = [];
}
