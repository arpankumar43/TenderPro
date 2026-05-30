namespace TenderPro.Domain.Entities;

public enum ChecklistPriority { High, Medium, Low }
public enum ChecklistCategory { Documents, Eligibility, Technical, Submission, Financial, Other }

public class ChecklistItem
{
    public Guid Id { get; set; }
    public Guid TenderId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ChecklistCategory Category { get; set; } = ChecklistCategory.Other;
    public bool IsCompleted { get; set; } = false;
    public ChecklistPriority Priority { get; set; } = ChecklistPriority.Medium;
    public Guid? LinkedRequirementId { get; set; }
    public Guid? LinkedDeadlineId { get; set; }

    public Tender? Tender { get; set; }
    public Requirement? LinkedRequirement { get; set; }
    public Deadline? LinkedDeadline { get; set; }
}
