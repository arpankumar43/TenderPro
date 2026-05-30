using TenderPro.Application.DTOs;

namespace TenderPro.Application.Interfaces;

public interface IAiAnalysisService
{
    Task<AnalysisResultDto> AnalyzeAsync(byte[] fileBytes, string mimeType, string fileName);
}
