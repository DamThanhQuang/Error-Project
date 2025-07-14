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
    public class ProductionProcessController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductionProcessController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductionProcess>>> GetProductionProcesses()
        {
            return await _context.ProductionProcesses
                .Include(p => p.Steps)
                .Where(p => p.IsActive)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductionProcess>> GetProductionProcess(int id)
        {
            var process = await _context.ProductionProcesses
                .Include(p => p.Steps)
                .Include(p => p.Errors)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (process == null)
            {
                return NotFound();
            }

            return process;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ProductionProcess>> PostProductionProcess(ProductionProcess process)
        {
            process.CreatedAt = DateTime.Now;
            process.UpdatedAt = DateTime.Now;

            _context.ProductionProcesses.Add(process);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProductionProcess", new { id = process.Id }, process);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> PutProductionProcess(int id, ProductionProcess process)
        {
            if (id != process.Id)
            {
                return BadRequest();
            }

            process.UpdatedAt = DateTime.Now;
            _context.Entry(process).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductionProcessExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProductionProcess(int id)
        {
            var process = await _context.ProductionProcesses.FindAsync(id);
            if (process == null)
            {
                return NotFound();
            }

            process.IsActive = false;
            process.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/steps")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ProcessStep>> AddStep(int id, ProcessStep step)
        {
            var process = await _context.ProductionProcesses.FindAsync(id);
            if (process == null)
            {
                return NotFound();
            }

            step.ProductionProcessId = id;
            step.CreatedAt = DateTime.Now;

            _context.ProcessSteps.Add(step);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProductionProcess", new { id = process.Id }, step);
        }

        private bool ProductionProcessExists(int id)
        {
            return _context.ProductionProcesses.Any(e => e.Id == id);
        }
    }
}