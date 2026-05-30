using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using TenderPro.Application.DTOs;
using TenderPro.Application.Interfaces;

namespace TenderPro.Infrastructure.AI;

public class GeminiAnalysisService(IHttpClientFactory httpClientFactory, IConfiguration config) : IAiAnalysisService
{
    //private const string GeminiModel = "gemini-2.0-flash";
    private const string GeminiModel = "gemini-3.5-flash";

    public async Task<AnalysisResultDto> AnalyzeAsync(byte[] fileBytes, string mimeType, string fileName)
    {
        var apiKey = config["GeminiApiKey"]
            ?? throw new InvalidOperationException("GeminiApiKey is not configured.");

        var base64Data = Convert.ToBase64String(fileBytes);

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new object[]
                    {
                        new { text = GetSystemPrompt() },
                        new { inline_data = new { mime_type = mimeType, data = base64Data } }
                    }
                }
            },
            generationConfig = new
            {
                responseMimeType = "application/json",
                responseSchema = GetResponseSchema()
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var client = httpClientFactory.CreateClient("Gemini");
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{GeminiModel}:generateContent?key={apiKey}";

        var response = await client.PostAsync(url,
            new StringContent(json, Encoding.UTF8, "application/json"));

        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception($"Gemini API error {response.StatusCode}: {responseBody}");

        using var doc = JsonDocument.Parse(responseBody);
        var text = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? "{}";

        var result = JsonSerializer.Deserialize<AnalysisResultDto>(text, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? new AnalysisResultDto();

        return result;
    }

    private static string GetSystemPrompt() =>
        """
        You are an expert procurement and tender analyst with deep knowledge of government RFPs and tenders.
        Analyze the provided document and extract ALL required information with high precision.
        
        For eligibility criteria: extract every requirement a bidder must meet.
        For deadlines: extract ALL dates mentioned (submission, queries, opening, etc).
        For required documents: list every attachment/document required for bid submission.
        For scoring criteria: extract evaluation weightages if present.
        For the compliance checklist: generate a comprehensive action list for a bidder.
        
        Respond ONLY with structured JSON matching the schema exactly.
        """;

    private static object GetResponseSchema() => new
    {
        type = "OBJECT",
        properties = new
        {
            tenderNoticeNo = new { type = "STRING", description = "Tender/Notice reference number" },
            issuer = new { type = "STRING", description = "Issuing organization or authority" },
            nameOfWork = new { type = "STRING", description = "Project or work title" },
            tenderType = new { type = "STRING", description = "Works, Goods, Services, or Consultancy" },
            estimatedValue = new { type = "STRING", description = "Estimated contract value" },
            executiveSummary = new { type = "STRING", description = "3-paragraph plain-English summary of the tender" },
            eligibilitySummary = new { type = "STRING", description = "Plain-English summary of who can bid" },
            overallComplexity = new { type = "STRING", description = "Low, Medium, or High" },
            itemsList = new { type = "ARRAY", items = new { type = "STRING" } },
            contactDetails = new { type = "ARRAY", items = new { type = "STRING" } },
            eligibility = new
            {
                type = "ARRAY",
                items = new
                {
                    type = "OBJECT",
                    properties = new
                    {
                        title = new { type = "STRING" },
                        description = new { type = "STRING" },
                        isMandatory = new { type = "BOOLEAN" },
                        category = new { type = "STRING", description = "Financial, Experience, Certifications, Technical, Legal, etc." }
                    }
                }
            },
            deadlines = new
            {
                type = "ARRAY",
                items = new
                {
                    type = "OBJECT",
                    properties = new
                    {
                        @event = new { type = "STRING" },
                        date = new { type = "STRING" },
                        isHardDeadline = new { type = "BOOLEAN" }
                    }
                }
            },
            requiredDocuments = new
            {
                type = "ARRAY",
                items = new
                {
                    type = "OBJECT",
                    properties = new
                    {
                        name = new { type = "STRING" },
                        description = new { type = "STRING" },
                        isMandatory = new { type = "BOOLEAN" },
                        acceptedFormats = new { type = "STRING" }
                    }
                }
            },
            scoringCriteria = new
            {
                type = "ARRAY",
                items = new
                {
                    type = "OBJECT",
                    properties = new
                    {
                        criteria = new { type = "STRING" },
                        weight = new { type = "STRING" }
                    }
                }
            },
            complianceChecklist = new
            {
                type = "ARRAY",
                items = new
                {
                    type = "OBJECT",
                    properties = new
                    {
                        title = new { type = "STRING" },
                        category = new { type = "STRING", description = "Documents, Eligibility, Technical, Submission, Financial, Other" },
                        priority = new { type = "STRING", description = "High, Medium, or Low" }
                    }
                }
            }
        }
    };
}
