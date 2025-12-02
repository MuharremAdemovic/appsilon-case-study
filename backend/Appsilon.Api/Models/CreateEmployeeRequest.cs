namespace Appsilon.Api.Models;

public class CreateEmployeeRequest
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Department { get; set; } = null!;
}
