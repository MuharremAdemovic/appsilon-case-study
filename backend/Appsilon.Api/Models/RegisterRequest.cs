namespace Appsilon.Api.Models;

public class RegisterRequest
{
    public string Name { get; set; } = null!;
    public string Department { get; set; } = null!;
    public string Password { get; set; } = null!;
}
