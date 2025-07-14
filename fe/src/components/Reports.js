import React, { useState, useEffect } from 'react';
import { dashboardAPI, productionProcessAPI } from '../services/api';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    processLine: '',
    severity: ''
  });

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    try {
      const response = await productionProcessAPI.getAll();
      setProcesses(response.data);
    } catch (error) {
      console.error('Error loading processes:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getReport(filters);
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Errors', reportData.totalErrors],
      ['', ''],
      ['By Status', ''],
      ...reportData.byStatus.map(item => [item.status, item.count]),
      ['', ''],
      ['By Severity', ''],
      ...reportData.bySeverity.map(item => [item.severity, item.count]),
      ['', ''],
      ['By Process Line', ''],
      ...reportData.byProcessLine.map(item => [item.processLine, item.count]),
      ['', ''],
      ['By Assignee', ''],
      ...reportData.byAssignee.map(item => [item.assignedTo, item.count])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error_report_${filters.fromDate}_to_${filters.toDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="reports">
      <h2>Báo cáo</h2>

      {/* Filter Form */}
      <div className="report-filters">
        <div className="filter-group">
          <label>Từ ngày:</label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
          />
        </div>
        <div className="filter-group">
          <label>Đến ngày:</label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters({...filters, toDate: e.target.value})}
          />
        </div>
        <div className="filter-group">
          <label>Quy trình:</label>
          <select
            value={filters.processLine}
            onChange={(e) => setFilters({...filters, processLine: e.target.value})}
          >
            <option value="">All Processes</option>
            {processes.map(process => (
              <option key={process.id} value={process.processName}>
                {process.processName}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Mức độ nghiêm trọng:</label>
          <select
            value={filters.severity}
            onChange={(e) => setFilters({...filters, severity: e.target.value})}
          >
            <option value="">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <button onClick={generateReport} disabled={loading} className="generate-btn">
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="report-results">
          <div className="report-header">
            <h3>Report Results</h3>
            <button onClick={exportToCSV} className="export-btn">
              Export to CSV
            </button>
          </div>

          <div className="report-summary">
            <div className="summary-item">
              <h4>Tổng số lỗi</h4>
              <p>{reportData.totalErrors}</p>
            </div>
          </div>

          <div className="report-sections">
            <div className="report-section">
              <h4>By Status</h4>
              <div className="report-chart">
                {reportData.byStatus.map((item, index) => (
                  <div key={index} className="chart-bar">
                    <span className="bar-label">{item.status}</span>
                    <div className="bar-container">
                      <div 
                        className="bar-fill" 
                        style={{ width: `${(item.count / reportData.totalErrors) * 100}%` }}
                      ></div>
                    </div>
                    <span className="bar-value">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-section">
              <h4>By Severity</h4>
              <div className="report-chart">
                {reportData.bySeverity.map((item, index) => (
                  <div key={index} className="chart-bar">
                    <span className="bar-label">{item.severity}</span>
                    <div className="bar-container">
                      <div 
                        className="bar-fill" 
                        style={{ width: `${(item.count / reportData.totalErrors) * 100}%` }}
                      ></div>
                    </div>
                    <span className="bar-value">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-section">
              <h4>By Process Line</h4>
              <div className="report-chart">
                {reportData.byProcessLine.map((item, index) => (
                  <div key={index} className="chart-bar">
                    <span className="bar-label">{item.processLine}</span>
                    <div className="bar-container">
                      <div 
                        className="bar-fill" 
                        style={{ width: `${(item.count / reportData.totalErrors) * 100}%` }}
                      ></div>
                    </div>
                    <span className="bar-value">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-section">
              <h4>By Assignee</h4>
              <div className="report-chart">
                {reportData.byAssignee.map((item, index) => (
                  <div key={index} className="chart-bar">
                    <span className="bar-label">{item.assignedTo}</span>
                    <div className="bar-container">
                      <div 
                        className="bar-fill" 
                        style={{ width: `${(item.count / reportData.totalErrors) * 100}%` }}
                      ></div>
                    </div>
                    <span className="bar-value">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;