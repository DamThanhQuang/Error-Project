using System.ComponentModel.DataAnnotations;

namespace ProcessErrorManagementApp.Models
{
    public class ErrorComment
    {
        public int Id { get; set; }
        
        [Required]
        public string Comment { get; set; } = string.Empty;
        
        public int ProcessErrorId { get; set; }
        public ProcessError ProcessError { get; set; } = null!;
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}