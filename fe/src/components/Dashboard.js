import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await dashboardAPI.getDashboard();
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!dashboardData) return <div>Error loading dashboard</div>;

  return (
    <div className="dashboard">
      <h2>Dashboard - Xin chào {user?.fullName}</h2>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Tổng số lỗi</h3>
          <p className="number">{dashboardData.totalErrors}</p>
        </div>
        <div className="card open">
          <h3>Lỗi chưa xử lí</h3>
          <p className="number">{dashboardData.openErrors}</p>
        </div>
        <div className="card progress">
          <h3>Đang xử lí</h3>
          <p className="number">{dashboardData.inProgressErrors}</p>
        </div>
        <div className="card resolved">
          <h3>Đã giải quyết</h3>
          <p className="number">{dashboardData.resolvedErrors}</p>
        </div>
        <div className="card critical">
          <h3>Nguy cấp</h3>
          <p className="number">{dashboardData.criticalErrors}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Lỗi theo quy trình</h3>
          <div className="chart-list">
            {dashboardData.errorsByProcess.map((item, index) => (
              <div key={index} className="chart-item">
                <span>{item.processLine}</span>
                <span className="count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <h3>Lỗi theo mức độ nghiêm trọng</h3>
          <div className="chart-list">
            {dashboardData.errorsBySeverity.map((item, index) => (
              <div key={index} className="chart-item">
                <span className={`severity ${item.severity.toLowerCase()}`}>
                  {item.severity}
                </span>
                <span className="count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <h3>Lỗi theo người được giao</h3>
          <div className="chart-list">
            {dashboardData.errorsByAssignee.map((item, index) => (
              <div key={index} className="chart-item">
                <span>{item.assignedTo}</span>
                <span className="count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;