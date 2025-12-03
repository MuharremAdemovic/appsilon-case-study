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

        // 2. Create CameraLog (Pending Analysis)
        var imageUrl = $"/uploads/{uniqueFileName}";

        var log = new CameraLog
        {
            Id = Guid.NewGuid(),
            ImageUrl = imageUrl,
            ModelOutputJson = "{}", // Empty initially
            CreatedAt = DateTime.UtcNow
        };

        _db.CameraLogs.Add(log);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = log.Id }, log);
    }

    [HttpPost("{id:guid}/analyze")]
    public async Task<IActionResult> Analyze(Guid id)
    {
        var log = await _db.CameraLogs.FindAsync(id);
        if (log == null) return NotFound();

        // Construct file path from ImageUrl
        // ImageUrl is like "/uploads/filename.jpg"
        // We need physical path: "wwwroot/uploads/filename.jpg"
        var relativePath = log.ImageUrl.TrimStart('/');
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);

        if (!System.IO.File.Exists(filePath))
        {
            return BadRequest("Image file not found on server.");
        }

        string modelOutputJson;
        try
        {
            var pythonScriptPath = "/app/ml/inference.py";
            var startInfo = new System.Diagnostics.ProcessStartInfo
            {
                FileName = "python3",
                Arguments = $"{pythonScriptPath} \"{filePath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using (var process = System.Diagnostics.Process.Start(startInfo))
            {
                if (process == null) throw new Exception("Failed to start Python process.");

                var output = await process.StandardOutput.ReadToEndAsync();
                var error = await process.StandardError.ReadToEndAsync();
                await process.WaitForExitAsync();

                if (process.ExitCode != 0)
                {
                    Console.WriteLine($"Python Error: {error}");
                    modelOutputJson = JsonSerializer.Serialize(new { error = "ML Inference Failed", details = error });
                }
                else
                {
                    // Extract JSON from output (find first '{' and last '}')
                    var firstBrace = output.IndexOf('{');
                    var lastBrace = output.LastIndexOf('}');
                    
                    if (firstBrace >= 0 && lastBrace > firstBrace)
                    {
                        var rawJson = output.Substring(firstBrace, lastBrace - firstBrace + 1);
                        try 
                        {
                            using var doc = JsonDocument.Parse(rawJson);
                            modelOutputJson = JsonSerializer.Serialize(doc.RootElement, new JsonSerializerOptions { WriteIndented = true });
                        }
                        catch
                        {
                            modelOutputJson = rawJson;
                        }
                    }
                    else
                    {
                        modelOutputJson = output;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ML Execution Error: {ex.Message}");
            modelOutputJson = JsonSerializer.Serialize(new { error = "ML Execution Error", details = ex.Message });
        }

        log.ModelOutputJson = modelOutputJson;
        await _db.SaveChangesAsync();

        return Ok(log);
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

    // DELETE: api/cameralogs/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var log = await _db.CameraLogs.FindAsync(id);
        if (log == null)
            return NotFound();

        _db.CameraLogs.Remove(log);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
