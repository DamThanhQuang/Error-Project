using System.ComponentModel.DataAnnotations;

namespace ProcessErrorManagementApp.Models
{
    public class Notification
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        public string Type { get; set; } = "Info"; // Info, Warning, Error, Success
        
        public int? ProcessErrorId { get; set; }
        public ProcessError? ProcessError { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}