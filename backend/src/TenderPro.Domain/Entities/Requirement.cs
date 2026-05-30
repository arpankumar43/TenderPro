namespace TenderPro.Domain.Entities;

public enum RequirementType { Eligibility, Technical, Financial, Legal, Other }

public class Requirement
{
    public Guid Id { get; set; }
    public Guid TenderId { get; set; }
    public RequirementType Type { get; set; } = RequirementType.Other;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PlainEnglish { get; set; } = string.Empty;
    public bool IsMandatory { get; set; } = true;
    public int? SourcePage { get; set; }
    public string Category { get; set; } = string.Empty;

    public Tender? Tender { get; set; }
}
