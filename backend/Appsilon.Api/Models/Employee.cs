namespace Appsilon.Api.Models;

public class Employee
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;        // ZORUNLU
    public string Department { get; set; } = null!;
    public string PasswordHash { get; set; } = null!; // Şifre burada tutuluyor
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
