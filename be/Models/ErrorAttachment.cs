using System.ComponentModel.DataAnnotations;

namespace ProcessErrorManagementApp.Models
{
    public class ErrorAttachment
    {
        public int Id { get; set; }
        
        [Required]
        public string FileName { get; set; } = string.Empty;
        
        [Required]
        public string FilePath { get; set; } = string.Empty;
        
        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        
        public int ProcessErrorId { get; set; }
        public ProcessError ProcessError { get; set; } = null!;
        
        public int UploadedById { get; set; }
        public User UploadedBy { get; set; } = null!;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}