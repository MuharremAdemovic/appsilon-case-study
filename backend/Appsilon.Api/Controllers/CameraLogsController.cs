using Appsilon.Api.Data;
using Appsilon.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Appsilon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CameraLogsController : ControllerBase
{
    private readonly AppDbContext _db;

    public CameraLogsController(AppDbContext db)
    {
        _db = db;
    }

    // GET: api/cameralogs
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CameraLog>>> GetAll()
    {
        var logs = await _db.CameraLogs
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(logs);
    }

    // GET: api/cameralogs/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CameraLog>> GetById(Guid id)
    {
        var log = await _db.CameraLogs.FindAsync(id);
        if (log == null)
            return NotFound();

        return Ok(log);
    }

    // POST: api/cameralogs
    // Body örneği:
    // {
    //   "imageUrl": "https://example.com/sample.jpg",
    //   "modelOutput": { "image_id": "sample.jpg", "objects": [ ... ] }
    // }
    public class CreateCameraLogRequest
    {
        public string ImageUrl { get; set; } = null!;
        public JsonElement ModelOutput { get; set; }
    }

    [HttpPost]
    public async Task<ActionResult<CameraLog>> Create([FromBody] CreateCameraLogRequest request)
    {
        // ML output'u string olarak kaydediyoruz (JSON stringify)
        var modelOutputJson = JsonSerializer.Serialize(request.ModelOutput);

        var log = new CameraLog
        {
            Id = Guid.NewGuid(),
            ImageUrl = request.ImageUrl,
            ModelOutputJson = modelOutputJson,
            CreatedAt = DateTime.UtcNow
        };

        _db.CameraLogs.Add(log);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = log.Id }, log);
    }
}
