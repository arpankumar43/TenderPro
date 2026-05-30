using Microsoft.AspNetCore.Mvc;
using TenderPro.Application.DTOs;
using TenderPro.Application.Services;

namespace TenderPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChecklistController(TenderProcessingService tenderService) : ControllerBase
{
    /// <summary>Toggle the IsCompleted state of a checklist item</summary>
    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<ChecklistItemDto>> Toggle(Guid id, [FromBody] ChecklistUpdateDto dto)
    {
        var item = await tenderService.ToggleChecklistItemAsync(id, dto.IsCompleted);
        if (item == null) return NotFound(new { error = $"Checklist item {id} not found." });
        return Ok(item);
    }
}
