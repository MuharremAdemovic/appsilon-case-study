using Appsilon.Api.Data;
using Appsilon.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Appsilon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/Auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // 1) Email'e göre kullanıcıyı bul
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Email == request.Email);

        if (employee == null)
            return Unauthorized("Invalid email or password");

        // 2) Şifreyi verify et
        if (!BCrypt.Net.BCrypt.Verify(request.Password, employee.PasswordHash))
            return Unauthorized("Invalid email or password");

        // 3) Basit login cevabı (şimdilik JWT üretmiyoruz)
        return Ok(new
        {
            employee.Id,
            employee.Name,
            employee.Email,
            employee.Department
        });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}
