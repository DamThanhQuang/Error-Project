using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProcessErrorManagementApp.Data;
using ProcessErrorManagementApp.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ProcessErrorManagementApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProcessErrorController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ProcessErrorController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProcessError>>> GetProcessErrors()
        {
            return await _context.ProcessErrors
                .Include(e => e.ProductionProcess)
                .Include(e => e.ProcessStep)
                .Include(e => e.CreatedBy)
                .Include(e => e.AssignedTo)
                .Include(e => e.Comments)
                .Include(e => e.Attachments)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProcessError>> GetProcessError(int id)
        {
            var processError = await _context.ProcessErrors
                .Include(e => e.ProductionProcess)
                .Include(e => e.ProcessStep)
                .Include(e => e.CreatedBy)
                .Include(e => e.AssignedTo)
                .Include(e => e.Comments)
                    .ThenInclude(c => c.User)
                .Include(e => e.Attachments)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (processError == null)
            {
                return NotFound();
            }

            return processError;
        }

        [HttpPost]
        public async Task<ActionResult<ProcessError>> PostProcessError(ProcessError processError)
        {
            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            
            processError.ErrorCode = await GenerateErrorCode();
            processError.CreatedAt = DateTime.Now;
            processError.UpdatedAt = DateTime.Now;
            processError.CreatedById = userId;

            _context.ProcessErrors.Add(processError);
            await _context.SaveChangesAsync();

            // Tạo audit log
            await CreateAuditLog("ProcessError", processError.Id, "Create", "", processError, userId);

            // Tạo notification
            await CreateNotification(processError);

            return CreatedAtAction("GetProcessError", new { id = processError.Id }, processError);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutProcessError(int id, ProcessError processError)
        {
            if (id != processError.Id)
            {
                return BadRequest();
            }

            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            var existingError = await _context.ProcessErrors.FindAsync(id);
            if (existingError == null)
            {
                return NotFound();
            }

            var oldValues = existingError;
            
            processError.UpdatedAt = DateTime.Now;
            processError.UpdatedById = userId;

            // Cập nhật thời gian khi thay đổi trạng thái
            if (existingError.Status != processError.Status)
            {
                if (processError.Status == "Resolved")
                {
                    processError.ResolvedAt = DateTime.Now;
                }
                else if (processError.Status == "In Progress" && existingError.Status == "Open")
                {
                    processError.AssignedAt = DateTime.Now;
                }
            }

            _context.Entry(existingError).CurrentValues.SetValues(processError);
            await _context.SaveChangesAsync();

            // Tạo audit log
            await CreateAuditLog("ProcessError", id, "Update", oldValues, processError, userId);

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> DeleteProcessError(int id)
        {
            var processError = await _context.ProcessErrors.FindAsync(id);
            if (processError == null)
            {
                return NotFound();
            }

            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");

            _context.ProcessErrors.Remove(processError);
            await _context.SaveChangesAsync();

            // Tạo audit log
            await CreateAuditLog("ProcessError", id, "Delete", processError, "", userId);

            return NoContent();
        }

        [HttpPost("{id}/assign")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> AssignError(int id, AssignErrorRequest request)
        {
            var error = await _context.ProcessErrors.FindAsync(id);
            if (error == null)
            {
                return NotFound();
            }

            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            var oldValues = error;

            error.AssignedToId = request.AssignedToId;
            error.AssignedDepartment = request.AssignedDepartment;
            error.AssignedAt = DateTime.Now;
            error.DueDate = request.DueDate;
            error.Status = "In Progress";
            error.UpdatedAt = DateTime.Now;
            error.UpdatedById = userId;

            await _context.SaveChangesAsync();

            // Tạo audit log
            await CreateAuditLog("ProcessError", id, "Assign", oldValues, error, userId);

            // Tạo notification cho người được giao
            if (request.AssignedToId.HasValue)
            {
                await CreateAssignmentNotification(error, request.AssignedToId.Value);
            }

            return Ok();
        }

        [HttpPost("{id}/comments")]
        public async Task<ActionResult<ErrorComment>> AddComment(int id, ErrorComment comment)
        {
            var error = await _context.ProcessErrors.FindAsync(id);
            if (error == null)
            {
                return NotFound();
            }

            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            
            comment.ProcessErrorId = id;
            comment.UserId = userId;
            comment.CreatedAt = DateTime.Now;

            _context.ErrorComments.Add(comment);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProcessError", new { id = id }, comment);
        }

        [HttpPost("{id}/attachments")]
        public async Task<IActionResult> UploadAttachment(int id, IFormFile file)
        {
            var error = await _context.ProcessErrors.FindAsync(id);
            if (error == null)
            {
                return NotFound();
            }

            if (file != null && file.Length > 0)
            {
                var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{id}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                var attachment = new ErrorAttachment
                {
                    ProcessErrorId = id,
                    FileName = file.FileName,
                    FilePath = $"/uploads/{fileName}",
                    FileType = file.ContentType,
                    FileSize = file.Length,
                    UploadedById = userId,
                    CreatedAt = DateTime.Now
                };

                _context.ErrorAttachments.Add(attachment);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "File uploaded successfully" });
        }

        private async Task<string> GenerateErrorCode()
        {
            var today = DateTime.Now.ToString("yyyyMMdd");
            var count = await _context.ProcessErrors.CountAsync(e => e.ErrorCode.StartsWith($"ERR-{today}"));
            return $"ERR-{today}-{(count + 1):D3}";
        }

        private async Task CreateAuditLog(string entityType, int entityId, string action, object oldValues, object newValues, int userId)
        {
            var auditLog = new AuditLog
            {
                EntityType = entityType,
                EntityId = entityId,
                Action = action,
                OldValues = System.Text.Json.JsonSerializer.Serialize(oldValues),
                NewValues = System.Text.Json.JsonSerializer.Serialize(newValues),
                UserId = userId,
                CreatedAt = DateTime.Now,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "",
                UserAgent = HttpContext.Request.Headers["User-Agent"].ToString()
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        private async Task CreateNotification(ProcessError error)
        {
            // Notification cho manager khi có lỗi mới
            var managers = await _context.Users
                .Where(u => u.Role == "Manager" || u.Role == "Admin")
                .ToListAsync();

            foreach (var manager in managers)
            {
                var notification = new Notification
                {
                    Title = "New Error Reported",
                    Message = $"New error '{error.Title}' has been reported in process {error.ProductionProcess?.ProcessName}",
                    Type = error.Severity == "Critical" ? "Error" : "Warning",
                    ProcessErrorId = error.Id,
                    UserId = manager.Id,
                    CreatedAt = DateTime.Now
                };

                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
        }

        private async Task CreateAssignmentNotification(ProcessError error, int assignedToId)
        {
            var notification = new Notification
            {
                Title = "Error Assigned to You",
                Message = $"Error '{error.Title}' has been assigned to you for resolution",
                Type = "Info",
                ProcessErrorId = error.Id,
                UserId = assignedToId,
                CreatedAt = DateTime.Now
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }
    }

    public class AssignErrorRequest
    {
        public int? AssignedToId { get; set; }
        public string AssignedDepartment { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
    }
}