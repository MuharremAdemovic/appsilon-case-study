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

    [HttpPost("upload")]
    public async Task<ActionResult<CameraLog>> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        // 1. Save file to wwwroot/uploads
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // 2. Generate Mock ML Output
        var mockOutput = new
        {
            detected_objects = new[]
            {
                new { label = "person", confidence = 0.98, bbox = new[] { 100, 200, 50, 80 } },
                new { label = "backpack", confidence = 0.85, bbox = new[] { 120, 220, 30, 40 } }
            },
            processing_time_ms = 125
        };
        var modelOutputJson = JsonSerializer.Serialize(mockOutput);

        // 3. Create CameraLog
        // Assuming the server URL is accessible via relative path or we construct full URL
        // For simplicity, we'll store the relative path or full URL if we knew the host.
        // Let's store relative path "/uploads/..." and let frontend handle base URL or just use relative.
        var imageUrl = $"/uploads/{uniqueFileName}";

        var log = new CameraLog
        {
            Id = Guid.NewGuid(),
            ImageUrl = imageUrl,
            ModelOutputJson = modelOutputJson,
            CreatedAt = DateTime.UtcNow
        };

        _db.CameraLogs.Add(log);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = log.Id }, log);
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
