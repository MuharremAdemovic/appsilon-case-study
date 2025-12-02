namespace Appsilon.Api.Models;

public class Employee
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    // Kullanıcı login olurken email ile giriş yapacak
    public string Email { get; set; } = null!;

    // Parolanın HASH değeri kaydedilir, açık parola tutulmaz
    public string PasswordHash { get; set; } = null!;

    // Hangi departmana ait? IT / HR / Finance vs.
    public string Department { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
