import React, { useState, useEffect, useCallback } from 'react';
import { processErrorAPI, productionProcessAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ErrorList = () => {
  const [errors, setErrors] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingError, setEditingError] = useState(null);
  const [selectedError, setSelectedError] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [newError, setNewError] = useState({
    title: '',
    description: '',
    productionProcessId: '',
    processStepId: '',
    detectedBy: '',
    severity: 'Medium',
    occurredAt: new Date().toISOString().slice(0, 16)
  });
  const [assignData, setAssignData] = useState({
    assignedToId: '',
    assignedDepartment: '',
    dueDate: ''
  });
  const [newComment, setNewComment] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    processId: ''
  });

  const { user, hasAnyRole } = useAuth();

  const loadData = useCallback(async () => {
    try {
      const [errorsRes, processesRes, usersRes] = await Promise.all([
        processErrorAPI.getAll(),
        productionProcessAPI.getAll(),
        hasAnyRole(['Admin', 'Manager']) ? userAPI.getEmployees() : Promise.resolve({ data: [] })
      ]);
      
      setErrors(errorsRes.data);
      setProcesses(processesRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  }, [hasAnyRole]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingError) {
        await processErrorAPI.update(editingError.id, newError);
      } else {
        await processErrorAPI.create(newError);
      }
      setShowForm(false);
      setEditingError(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving error:', error);
      alert('Failed to save error');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await processErrorAPI.assign(selectedError.id, assignData);
      setShowAssignForm(false);
      setSelectedError(null);
      setAssignData({
        assignedToId: '',
        assignedDepartment: '',
        dueDate: ''
      });
      loadData();
    } catch (error) {
      console.error('Error assigning error:', error);
      alert('Failed to assign error');
    }
  };

  const handleAddComment = async (errorId) => {
    if (!newComment.trim()) return;
    
    try {
      await processErrorAPI.addComment(errorId, { comment: newComment });
      setNewComment('');
      loadData();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleFileUpload = async (errorId, file) => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await processErrorAPI.uploadAttachment(errorId, formData);
      loadData();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    }
  };

  const handleStatusChange = async (errorId, newStatus) => {
    try {
      const error = errors.find(e => e.id === errorId);
      await processErrorAPI.update(errorId, { ...error, status: newStatus });
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const resetForm = () => {
    setNewError({
      title: '',
      description: '',
      productionProcessId: '',
      processStepId: '',
      detectedBy: '',
      severity: 'Medium',
      occurredAt: new Date().toISOString().slice(0, 16)
    });
  };

  const filteredErrors = errors.filter(error => {
    return (
      (!filters.status || error.status === filters.status) &&
      (!filters.severity || error.severity === filters.severity) &&
      (!filters.processId || error.productionProcessId.toString() === filters.processId)
    );
  });

  if (loading) return <div className="loading">Loading errors...</div>;

  return (
    <div className="error-management">
      <div className="header">
        <h2>Quản lí lỗi</h2>
        <button onClick={() => setShowForm(true)} className="add-btn">
          Báo cáo lỗi mới
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        
        <select
          value={filters.severity}
          onChange={(e) => setFilters({...filters, severity: e.target.value})}
        >
          <option value="">All Severity</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
        
        <select
          value={filters.processId}
          onChange={(e) => setFilters({...filters, processId: e.target.value})}
        >
          <option value="">All Processes</option>
          {processes.map(process => (
            <option key={process.id} value={process.id}>
              {process.processName}
            </option>
          ))}
        </select>
      </div>

      {/* Error Form Modal */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingError ? 'Edit Error' : 'Report New Error'}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Error Title"
                value={newError.title}
                onChange={(e) => setNewError({...newError, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                value={newError.description}
                onChange={(e) => setNewError({...newError, description: e.target.value})}
                required
              />
              <select
                value={newError.productionProcessId}
                onChange={(e) => setNewError({...newError, productionProcessId: e.target.value})}
                required
              >
                <option value="">Select Process</option>
                {processes.map(process => (
                  <option key={process.id} value={process.id}>
                    {process.processName}
                  </option>
                ))}
              </select>
              <select
                value={newError.severity}
                onChange={(e) => setNewError({...newError, severity: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              <input
                type="text"
                placeholder="Detected By"
                value={newError.detectedBy}
                onChange={(e) => setNewError({...newError, detectedBy: e.target.value})}
                required
              />
              <input
                type="datetime-local"
                value={newError.occurredAt}
                onChange={(e) => setNewError({...newError, occurredAt: e.target.value})}
                required
              />
              <div className="form-actions">
                <button type="submit">
                  {editingError ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setEditingError(null);
                  resetForm();
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Form Modal */}
      {showAssignForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Assign Error</h3>
            <form onSubmit={handleAssign}>
              <select
                value={assignData.assignedToId}
                onChange={(e) => setAssignData({...assignData, assignedToId: e.target.value})}
              >
                <option value="">Select Assignee</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.department})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Department"
                value={assignData.assignedDepartment}
                onChange={(e) => setAssignData({...assignData, assignedDepartment: e.target.value})}
              />
              <input
                type="datetime-local"
                placeholder="Due Date"
                value={assignData.dueDate}
                onChange={(e) => setAssignData({...assignData, dueDate: e.target.value})}
              />
              <div className="form-actions">
                <button type="submit">Assign</button>
                <button type="button" onClick={() => {
                  setShowAssignForm(false);
                  setSelectedError(null);
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error List */}
      <div className="error-list">
        {filteredErrors.map(error => (
          <div key={error.id} className="error-item">
            <div className="error-header">
              <h4>{error.title} ({error.errorCode})</h4>
              <div className="error-meta">
                <span className={`status ${error.status.toLowerCase().replace(' ', '-')}`}>
                  {error.status}
                </span>
                <span className={`severity ${error.severity.toLowerCase()}`}>
                  {error.severity}
                </span>
              </div>
            </div>
            
            <p>{error.description}</p>
            
            <div className="error-details">
              <p><strong>Process:</strong> {error.productionProcess?.processName}</p>
              <p><strong>Detected By:</strong> {error.detectedBy}</p>
              <p><strong>Occurred:</strong> {new Date(error.occurredAt).toLocaleString()}</p>
              {error.assignedTo && (
                <p><strong>Assigned To:</strong> {error.assignedTo.fullName}</p>
              )}
            </div>

            <div className="error-actions">
              {hasAnyRole(['Admin', 'Manager']) && error.status === 'Open' && (
                <button 
                  onClick={() => {
                    setSelectedError(error);
                    setShowAssignForm(true);
                  }}
                  className="assign-btn"
                >
                  Assign
                </button>
              )}
              
              {(user.id === error.assignedToId || hasAnyRole(['Admin', 'Manager'])) && (
                <select
                  value={error.status}
                  onChange={(e) => handleStatusChange(error.id, e.target.value)}
                  className="status-select"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              )}
            </div>

            {/* Comments */}
            {error.comments && error.comments.length > 0 && (
              <div className="comments-section">
                <h5>Comments:</h5>
                {error.comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <strong>{comment.user?.fullName}:</strong> {comment.comment}
                    <small> - {new Date(comment.createdAt).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            <div className="add-comment">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(error.id)}
              />
              <button onClick={() => handleAddComment(error.id)}>
                Add Comment
              </button>
            </div>

            {/* File Upload */}
            <div className="file-upload">
              <input
                type="file"
                onChange={(e) => handleFileUpload(error.id, e.target.files[0])}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorList;