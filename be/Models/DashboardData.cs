namespace ProcessErrorManagementApp.Models
{
    public class DashboardData
    {
        public int TotalErrors { get; set; }
        public int OpenErrors { get; set; }
        public int InProgressErrors { get; set; }
        public int ResolvedErrors { get; set; }
        public int CriticalErrors { get; set; }
        public List<ErrorsByProcess> ErrorsByProcess { get; set; } = new List<ErrorsByProcess>();
        public List<ErrorsByDay> ErrorsByDay { get; set; } = new List<ErrorsByDay>();
        public List<ErrorsBySeverity> ErrorsBySeverity { get; set; } = new List<ErrorsBySeverity>();
        public List<ErrorsByAssignee> ErrorsByAssignee { get; set; } = new List<ErrorsByAssignee>();
    }

    public class ErrorsByProcess
    {
        public string ProcessLine { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class ErrorsByDay
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }

    public class ErrorsBySeverity
    {
        public string Severity { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class ErrorsByAssignee
    {
        public string AssignedTo { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}