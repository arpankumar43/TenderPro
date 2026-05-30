namespace TenderPro.Domain.Entities;

public class Deadline
{
    public Guid Id { get; set; }
    public Guid TenderId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime? DateTime { get; set; }
    public string DateTimeRaw { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsHardDeadline { get; set; } = false;

    public int? DaysRemaining => DateTime.HasValue
        ? (int)(DateTime.Value - System.DateTime.UtcNow).TotalDays
        : null;

    public Tender? Tender { get; set; }
}
