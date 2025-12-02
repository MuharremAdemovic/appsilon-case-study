using Appsilon.Api.Data;
using Appsilon.Api.Models;
using Appsilon.Api.Models.Requests;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Appsilon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;

    public EmployeesController(AppDbContext context)
    {
        _context = context;
    }

  // GET api/employees
    [HttpGet]
    public async Task<IActionResult> GetEmployees()
    {
        if (!Request.Headers.TryGetValue("X-Employee-Id", out var employeeId))
            return BadRequest("Missing X-Employee-Id header");

        Guid id = Guid.Parse(employeeId!);

        var currentUser = await _context.Employees.FindAsync(id);
        if (currentUser == null)
            return Unauthorized("Invalid user");

        var employees = await _context.Employees
            .Where(e => e.Department == currentUser.Department)
            .ToListAsync();

        return Ok(employees);
    }

    // GET: api/Employees/5
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Employee>> GetEmployee(Guid id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
        {
            return NotFound();
        }

        return employee;
    }

    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeRequest request)
    {
        if (!Request.Headers.TryGetValue("X-Department", out var userDept))
            return BadRequest("Department header missing");

        // Duplicate check: Name + Department
        var potentialDuplicates = await _context.Employees
            .Where(e => e.Name == request.Name && e.Department == request.Department)
            .ToListAsync();

        foreach (var existing in potentialDuplicates)
        {
            if (BCrypt.Net.BCrypt.Verify(request.Password, existing.PasswordHash))
            {
                return Conflict("Bu isim, departman ve şifre ile kayıtlı bir çalışan zaten var.");
            }
        }

        var hashed = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var emp = new Employee
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            Department = request.Department,
            PasswordHash = hashed,
            CreatedAt = DateTime.UtcNow
        };

        _context.Employees.Add(emp);
        await _context.SaveChangesAsync();

        return Ok(emp);
    }


    // PUT: api/Employees/5
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateEmployee(Guid id, [FromBody] Employee updated)
    {
        if (id != updated.Id)
        {
            return BadRequest("Id in route and body must match.");
        }

        var existing = await _context.Employees.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        existing.Name = updated.Name;
        existing.Department = updated.Department;
        existing.UpdatedAt = DateTime.UtcNow;
        // CreatedAt'i değiştirmiyoruz

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Employees/5
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteEmployee(Guid id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
        {
            return NotFound();
        }

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Department))
        {
            return BadRequest("Name, Department and Password are required.");
        }

        // Aynı isimde user var mı? (Örnek amaçlı, normalde email vs. kullanılır)
        var existing = await _context.Employees
            .FirstOrDefaultAsync(x => x.Name == request.Name);

        if (existing != null)
            return Conflict("User already exists.");

        // Şifre hashle
        string hashed = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Yeni employee oluştur
        var emp = new Employee
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,                 // <-- BUNU EKLE
            Department = request.Department,
            PasswordHash = hashed,
            CreatedAt = DateTime.UtcNow
        };

        _context.Employees.Add(emp);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            emp.Id,
            emp.Name,
            emp.Department
        });
    }
}


