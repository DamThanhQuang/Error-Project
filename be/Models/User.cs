using System.ComponentModel.DataAnnotations;

namespace ProcessErrorManagementApp.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        public string Role { get; set; } = "Employee"; // Admin, Manager, Employee
        
        public string FullName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        
        // Navigation properties
        public ICollection<ProcessError> CreatedErrors { get; set; } = new List<ProcessError>();
        public ICollection<ProcessError> AssignedErrors { get; set; } = new List<ProcessError>();
        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}