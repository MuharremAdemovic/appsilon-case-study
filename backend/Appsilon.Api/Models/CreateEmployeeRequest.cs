namespace Appsilon.Api.Models;

public class CreateEmployeeRequest
{
    public string Name { get; set; } = null!;
    public string Password { get; set; } = null!;
    // Department istemiyoruz çünkü login yapan kişinin department'ı gelecek
}
