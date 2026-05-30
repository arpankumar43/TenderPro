using Microsoft.AspNetCore.Mvc;
using TenderPro.Application.DTOs;
using TenderPro.Application.Services;

namespace TenderPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TendersController(TenderProcessingService tenderService) : ControllerBase
{
    private const long MaxFileSizeBytes = 20 * 1024 * 1024; // 20 MB

    /// <summary>Upload and analyze a tender/RFP document (PDF)</summary>
    [HttpPost("upload")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<ActionResult<TenderDetailDto>> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file uploaded." });

        if (file.Length > MaxFileSizeBytes)
            return StatusCode(413, new { error = "File too large. Maximum size is 20 MB." });

        var allowedTypes = new[] { "application/pdf", "text/plain" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { error = "Unsupported file type. Please upload a PDF or text file." });

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var fileBytes = ms.ToArray();

        var result = await tenderService.ProcessUploadAsync(fileBytes, file.FileName, file.ContentType);
        return Ok(result);
    }

    /// <summary>List all tenders (summary view)</summary>
    [HttpGet]
    public async Task<ActionResult<List<TenderSummaryDto>>> GetAll()
    {
        var tenders = await tenderService.GetAllAsync();
        return Ok(tenders);
    }

    /// <summary>Get full tender analysis by ID</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TenderDetailDto>> GetById(Guid id)
    {
        var tender = await tenderService.GetByIdAsync(id);
        if (tender == null) return NotFound(new { error = $"Tender {id} not found." });
        return Ok(tender);
    }

    /// <summary>Delete a tender and its stored file</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await tenderService.DeleteAsync(id);
        if (!deleted) return NotFound(new { error = $"Tender {id} not found." });
        return NoContent();
    }
}
