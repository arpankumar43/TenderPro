namespace TenderPro.Application.DTOs;

// The raw structured response returned from Gemini AI
public class AnalysisResultDto
{
    public string TenderNoticeNo { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string NameOfWork { get; set; } = string.Empty;
    public string TenderType { get; set; } = string.Empty;
    public string EstimatedValue { get; set; } = string.Empty;
    public string ExecutiveSummary { get; set; } = string.Empty;
    public string EligibilitySummary { get; set; } = string.Empty;
    public string OverallComplexity { get; set; } = string.Empty;
    public List<string> ItemsList { get; set; } = [];
    public List<string> ContactDetails { get; set; } = [];
    public List<EligibilityItemDto> Eligibility { get; set; } = [];
    public List<DeadlineItemDto> Deadlines { get; set; } = [];
    public List<DocumentItemDto> RequiredDocuments { get; set; } = [];
    public List<ScoringItemDto> ScoringCriteria { get; set; } = [];
    public List<ChecklistItemResultDto> ComplianceChecklist { get; set; } = [];
}

public class EligibilityItemDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsMandatory { get; set; } = true;
    public string Category { get; set; } = string.Empty;
}

public class DeadlineItemDto
{
    public string Event { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public bool IsHardDeadline { get; set; } = false;
}

public class DocumentItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsMandatory { get; set; } = true;
    public string AcceptedFormats { get; set; } = string.Empty;
}

public class ScoringItemDto
{
    public string Criteria { get; set; } = string.Empty;
    public string Weight { get; set; } = string.Empty;
}

public class ChecklistItemResultDto
{
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
}
