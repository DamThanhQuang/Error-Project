using Microsoft.EntityFrameworkCore;
using ProcessErrorManagementApp.Models;

namespace ProcessErrorManagementApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<ProductionProcess> ProductionProcesses { get; set; }
        public DbSet<ProcessStep> ProcessSteps { get; set; }
        public DbSet<ProcessError> ProcessErrors { get; set; }
        public DbSet<ErrorComment> ErrorComments { get; set; }
        public DbSet<ErrorAttachment> ErrorAttachments { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User relationships
            modelBuilder.Entity<ProcessError>()
                .HasOne(e => e.CreatedBy)
                .WithMany(u => u.CreatedErrors)
                .HasForeignKey(e => e.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProcessError>()
                .HasOne(e => e.AssignedTo)
                .WithMany(u => u.AssignedErrors)
                .HasForeignKey(e => e.AssignedToId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ProcessError>()
                .HasOne(e => e.UpdatedBy)
                .WithMany()
                .HasForeignKey(e => e.UpdatedById)
                .OnDelete(DeleteBehavior.SetNull);

            // Process relationships
            modelBuilder.Entity<ProcessStep>()
                .HasOne(s => s.ProductionProcess)
                .WithMany(p => p.Steps)
                .HasForeignKey(s => s.ProductionProcessId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProcessError>()
                .HasOne(e => e.ProductionProcess)
                .WithMany(p => p.Errors)
                .HasForeignKey(e => e.ProductionProcessId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProcessError>()
                .HasOne(e => e.ProcessStep)
                .WithMany()
                .HasForeignKey(e => e.ProcessStepId)
                .OnDelete(DeleteBehavior.SetNull);

            // Error relationships
            modelBuilder.Entity<ErrorComment>()
                .HasOne(c => c.ProcessError)
                .WithMany(e => e.Comments)
                .HasForeignKey(c => c.ProcessErrorId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ErrorAttachment>()
                .HasOne(a => a.ProcessError)
                .WithMany(e => e.Attachments)
                .HasForeignKey(a => a.ProcessErrorId)
                .OnDelete(DeleteBehavior.Cascade);

            // Audit relationships
            modelBuilder.Entity<AuditLog>()
                .HasOne(a => a.User)
                .WithMany(u => u.AuditLogs)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Notification relationships
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.ProcessError)
                .WithMany()
                .HasForeignKey(n => n.ProcessErrorId)
                .OnDelete(DeleteBehavior.SetNull);

            base.OnModelCreating(modelBuilder);
        }
    }
}