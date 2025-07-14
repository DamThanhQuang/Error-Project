using System.ComponentModel.DataAnnotations;

namespace ProcessErrorManagementApp.Models
{
    public class ProductionProcess
    {
        public int Id { get; set; }
        
        [Required]
        public string ProcessCode { get; set; } = string.Empty;
        
        [Required]
        public string ProcessName { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        
        // Navigation properties
        public ICollection<ProcessStep> Steps { get; set; } = new List<ProcessStep>();
        public ICollection<ProcessError> Errors { get; set; } = new List<ProcessError>();
    }
    
    public class ProcessStep
    {
        public int Id { get; set; }
        
        [Required]
        public string StepName { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        public int StepOrder { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Foreign key
        public int ProductionProcessId { get; set; }
        public ProductionProcess ProductionProcess { get; set; } = null!;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}