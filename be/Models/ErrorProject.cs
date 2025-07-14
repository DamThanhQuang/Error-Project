using System.ComponentModel.DataAnnotations;

namespace ProcessErrorManagementApp.Models
{
    public class ProcessError
    {
        public int Id { get; set; }
        
        [Required]
        public string ErrorCode { get; set; } = string.Empty;
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        public string Status { get; set; } = "Open"; // Open, In Progress, Resolved, Closed
        public string Severity { get; set; } = "Medium"; // Low, Medium, High, Critical
        
        // Thông tin sản xuất
        public int ProductionProcessId { get; set; }
        public ProductionProcess ProductionProcess { get; set; } = null!;
        
        public int? ProcessStepId { get; set; }
        public ProcessStep? ProcessStep { get; set; }
        
        public DateTime OccurredAt { get; set; } = DateTime.Now;
        public string DetectedBy { get; set; } = string.Empty;
        
        // Thông tin xử lý
        public int? AssignedToId { get; set; }
        public User? AssignedTo { get; set; }
        
        public string AssignedDepartment { get; set; } = string.Empty;
        public DateTime? AssignedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? ResolvedAt { get; set; }
        
        // File đính kèm
        public string AttachmentPath { get; set; } = string.Empty;
        public string ImagePath { get; set; } = string.Empty;
        
        // Ghi chú xử lý
        public string ProcessingNotes { get; set; } = string.Empty;
        public string Resolution { get; set; } = string.Empty;
        
        // Audit
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        
        public int CreatedById { get; set; }
        public User CreatedBy { get; set; } = null!;
        
        public int? UpdatedById { get; set; }
        public User? UpdatedBy { get; set; }
        
        // Navigation properties
        public ICollection<ErrorComment> Comments { get; set; } = new List<ErrorComment>();
        public ICollection<ErrorAttachment> Attachments { get; set; } = new List<ErrorAttachment>();
    }
}