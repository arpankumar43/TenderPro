namespace TenderPro.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(byte[] fileBytes, string fileName);
    Task DeleteFileAsync(string storagePath);
}
