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

  // POST api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var emp = await _context.Employees
            .FirstOrDefaultAsync(e => e.Email == request.Email);

        if (emp == null)
            return Unauthorized("Invalid email or password");

        bool valid = BCrypt.Net.BCrypt.Verify(request.Password, emp.PasswordHash);
        if (!valid)
            return Unauthorized("Invalid email or password");

        return Ok(new
        {
            emp.Id,
            emp.Name,
            emp.Email,
            emp.Department
        });
    }


    // POST: api/Auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // 1) Email'e göre kullanıcıyı bul
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Email == request.Email);

        if (employee != null)
            return BadRequest("Email already exists");

        // 2) Şifreyi hash et
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // 3) Yeni kullanıcıyı oluştur
        var newEmployee = new Employee
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = passwordHash,
            Department = request.Department
        };

        // 4) Veritabanına kaydet
        _context.Employees.Add(newEmployee);
        await _context.SaveChangesAsync();

        // 5) Basit kayit cevabı
        return Ok(new
        {
            newEmployee.Id,
            newEmployee.Name,
            newEmployee.Email,
            newEmployee.Department
        });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}
