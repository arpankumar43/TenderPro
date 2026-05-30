using Microsoft.Extensions.Configuration;
using TenderPro.Application.Interfaces;

namespace TenderPro.Infrastructure.Storage;

public class LocalFileStorageService(IConfiguration config) : IFileStorageService
{
    private readonly string _uploadPath = config["FileStorage:UploadPath"] ?? "uploads";

    public async Task<string> SaveFileAsync(byte[] fileBytes, string fileName)
    {
        Directory.CreateDirectory(_uploadPath);
        var safeFileName = $"{Guid.NewGuid()}_{Path.GetFileName(fileName)}";
        var fullPath = Path.Combine(_uploadPath, safeFileName);
        await File.WriteAllBytesAsync(fullPath, fileBytes);
        return fullPath;
    }

    public Task DeleteFileAsync(string storagePath)
    {
        if (File.Exists(storagePath))
            File.Delete(storagePath);
        return Task.CompletedTask;
    }
}
