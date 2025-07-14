using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProcessErrorManagementApp.Data;
using ProcessErrorManagementApp.Models;
using Microsoft.AspNetCore.Authorization;

namespace ProcessErrorManagementApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<DashboardData>> GetDashboardData()
        {
            var dashboardData = new DashboardData();

            // Tổng số lỗi
            dashboardData.TotalErrors = await _context.ProcessErrors.CountAsync();
            dashboardData.OpenErrors = await _context.ProcessErrors.CountAsync(e => e.Status == "Open");
            dashboardData.InProgressErrors = await _context.ProcessErrors.CountAsync(e => e.Status == "In Progress");
            dashboardData.ResolvedErrors = await _context.ProcessErrors.CountAsync(e => e.Status == "Resolved");
            dashboardData.CriticalErrors = await _context.ProcessErrors.CountAsync(e => e.Severity == "Critical");

            // Lỗi theo quy trình
            dashboardData.ErrorsByProcess = await _context.ProcessErrors
                .Include(e => e.ProductionProcess)
                .Where(e => e.ProductionProcess != null)
                .GroupBy(e => e.ProductionProcess!.ProcessName)
                .Select(g => new ErrorsByProcess
                {
                    ProcessLine = g.Key ?? "Unknown",
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToListAsync();

            // Lỗi theo ngày (30 ngày gần nhất)
            var thirtyDaysAgo = DateTime.Now.AddDays(-30);
            dashboardData.ErrorsByDay = await _context.ProcessErrors
                .Where(e => e.CreatedAt >= thirtyDaysAgo)
                .GroupBy(e => e.CreatedAt.Date)
                .Select(g => new ErrorsByDay
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            // Lỗi theo mức độ nghiêm trọng
            dashboardData.ErrorsBySeverity = await _context.ProcessErrors
                .GroupBy(e => e.Severity)
                .Select(g => new ErrorsBySeverity
                {
                    Severity = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            // Lỗi theo người được giao
            dashboardData.ErrorsByAssignee = await _context.ProcessErrors
                .Include(e => e.AssignedTo)
                .Where(e => e.AssignedTo != null)
                .GroupBy(e => e.AssignedTo!.FullName)
                .Select(g => new ErrorsByAssignee
                {
                    AssignedTo = g.Key ?? "Unknown",
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToListAsync();

            return dashboardData;
        }

        [HttpGet("report")]
        public async Task<ActionResult> GetReport([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, 
            [FromQuery] string? processLine = null, [FromQuery] string? severity = null)
        {
            var query = _context.ProcessErrors
                .Include(e => e.ProductionProcess)
                .Include(e => e.AssignedTo)
                .AsQueryable();

            // Filter theo thời gian
            query = query.Where(e => e.CreatedAt >= fromDate && e.CreatedAt <= toDate);

            // Filter theo dây chuyền
            if (!string.IsNullOrEmpty(processLine))
            {
                query = query.Where(e => e.ProductionProcess != null && e.ProductionProcess.ProcessName == processLine);
            }

            // Filter theo mức độ nghiêm trọng
            if (!string.IsNullOrEmpty(severity))
            {
                query = query.Where(e => e.Severity == severity);
            }

            var errors = await query.ToListAsync();

            return Ok(new
            {
                TotalErrors = errors.Count,
                ByStatus = errors.GroupBy(e => e.Status).Select(g => new { Status = g.Key, Count = g.Count() }),
                BySeverity = errors.GroupBy(e => e.Severity).Select(g => new { Severity = g.Key, Count = g.Count() }),
                ByProcessLine = errors
                    .Where(e => e.ProductionProcess != null)
                    .GroupBy(e => e.ProductionProcess!.ProcessName)
                    .Select(g => new { ProcessLine = g.Key, Count = g.Count() }),
                ByAssignee = errors
                    .Where(e => e.AssignedTo != null)
                    .GroupBy(e => e.AssignedTo!.FullName)
                    .Select(g => new { AssignedTo = g.Key, Count = g.Count() }),
                ByDay = errors
                    .GroupBy(e => e.CreatedAt.Date)
                    .Select(g => new { Date = g.Key, Count = g.Count() })
                    .OrderBy(x => x.Date)
            });
        }
    }
}