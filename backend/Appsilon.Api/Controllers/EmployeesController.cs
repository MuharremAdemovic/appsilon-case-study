using Appsilon.Api.Data;
using Appsilon.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    // GET: api/Employees
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
    {
        return await _context.Employees
            .OrderBy(e => e.CreatedAt)
            .ToListAsync();
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

    // POST: api/Employees
    [HttpPost]
    public async Task<ActionResult<Employee>> CreateEmployee([FromBody] Employee employee)
    {
        // Id ve CreatedAt backend tarafında set edilsin
        employee.Id = Guid.NewGuid();
        employee.CreatedAt = DateTime.UtcNow;

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        // 201 Created + Location header
        return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
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
}
