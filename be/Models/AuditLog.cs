using System.ComponentModel.DataAnnotations;

namespace ProcessErrorManagementApp.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        
        [Required]
        public string EntityType { get; set; } = string.Empty; // ProcessError, User, etc.
        
        public int EntityId { get; set; }
        
        [Required]
        public string Action { get; set; } = string.Empty; // Create, Update, Delete, Assign, etc.
        
        public string OldValues { get; set; } = string.Empty; // JSON
        public string NewValues { get; set; } = string.Empty; // JSON
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
    }
}