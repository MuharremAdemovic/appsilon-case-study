namespace Appsilon.Api.Models.Requests;

public class LoginRequest
{
    public string Name { get; set; } = null!;
    public string Password { get; set; } = null!;
}
