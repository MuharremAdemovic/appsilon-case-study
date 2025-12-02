namespace Appsilon.Api.Models;

public class Employee
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Department { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
