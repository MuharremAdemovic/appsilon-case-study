namespace Appsilon.Api.Models;

public class CameraLog
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = null!;

    // ML modelinin çıktısını JSON string olarak saklayacağız
    public string ModelOutputJson { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
