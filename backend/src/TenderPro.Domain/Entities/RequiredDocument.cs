namespace TenderPro.Domain.Entities;

public class RequiredDocument
{
    public Guid Id { get; set; }
    public Guid TenderId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsMandatory { get; set; } = true;
    public string AcceptedFormats { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;

    public Tender? Tender { get; set; }
}
