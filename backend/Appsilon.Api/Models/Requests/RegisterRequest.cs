namespace Appsilon.Api.Models.Requests;

public class RegisterRequest
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Department { get; set; } = null!; // IT / HR / Finance
}
