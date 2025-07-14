import React, { useState, useEffect } from 'react';
import { productionProcessAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ProcessManagement = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [newProcess, setNewProcess] = useState({
    processCode: '',
    processName: '',
    description: '',
    department: ''
  });
  const [showStepForm, setShowStepForm] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState(null);
  const [newStep, setNewStep] = useState({
    stepName: '',
    description: '',
    stepOrder: 1
  });

  const { hasAnyRole } = useAuth();

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    try {
      const response = await productionProcessAPI.getAll();
      setProcesses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading processes:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProcess) {
        await productionProcessAPI.update(editingProcess.id, newProcess);
      } else {
        await productionProcessAPI.create(newProcess);
      }
      setShowForm(false);
      setEditingProcess(null);
      setNewProcess({
        processCode: '',
        processName: '',
        description: '',
        department: ''
      });
      loadProcesses();
    } catch (error) {
      console.error('Error saving process:', error);
      alert('Failed to save process');
    }
  };

  const handleEdit = (process) => {
    setEditingProcess(process);
    setNewProcess({
      processCode: process.processCode,
      processName: process.processName,
      description: process.description,
      department: process.department
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this process?')) {
      try {
        await productionProcessAPI.delete(id);
        loadProcesses();
      } catch (error) {
        console.error('Error deleting process:', error);
        alert('Failed to delete process');
      }
    }
  };

  const handleAddStep = async (e) => {
    e.preventDefault();
    try {
      await productionProcessAPI.addStep(selectedProcessId, newStep);
      setShowStepForm(false);
      setNewStep({
        stepName: '',
        description: '',
        stepOrder: 1
      });
      loadProcesses();
    } catch (error) {
      console.error('Error adding step:', error);
      alert('Failed to add step');
    }
  };

  if (loading) return <div className="loading">Loading processes...</div>;

  return (
    <div className="process-management">
      <div className="header">
        <h2>Quản lý quy trình sản xuất</h2>
        {hasAnyRole(['Admin', 'Manager']) && (
          <button 
            onClick={() => setShowForm(true)} 
            className="add-btn"
          >
            Thêm quy trình mới
          </button>
        )}
      </div>

      {/* Process Form */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingProcess ? 'Edit Process' : 'Add New Process'}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Process Code"
                value={newProcess.processCode}
                onChange={(e) => setNewProcess({...newProcess, processCode: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Process Name"
                value={newProcess.processName}
                onChange={(e) => setNewProcess({...newProcess, processName: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                value={newProcess.description}
                onChange={(e) => setNewProcess({...newProcess, description: e.target.value})}
              />
              <input
                type="text"
                placeholder="Department"
                value={newProcess.department}
                onChange={(e) => setNewProcess({...newProcess, department: e.target.value})}
              />
              <div className="form-actions">
                <button type="submit">
                  {editingProcess ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setEditingProcess(null);
                  setNewProcess({
                    processCode: '',
                    processName: '',
                    description: '',
                    department: ''
                  });
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step Form */}
      {showStepForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Step</h3>
            <form onSubmit={handleAddStep}>
              <input
                type="text"
                placeholder="Step Name"
                value={newStep.stepName}
                onChange={(e) => setNewStep({...newStep, stepName: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                value={newStep.description}
                onChange={(e) => setNewStep({...newStep, description: e.target.value})}
              />
              <input
                type="number"
                placeholder="Step Order"
                value={newStep.stepOrder}
                onChange={(e) => setNewStep({...newStep, stepOrder: parseInt(e.target.value)})}
                min="1"
              />
              <div className="form-actions">
                <button type="submit">Add Step</button>
                <button type="button" onClick={() => {
                  setShowStepForm(false);
                  setNewStep({
                    stepName: '',
                    description: '',
                    stepOrder: 1
                  });
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process List */}
      <div className="process-list">
        {processes.map(process => (
          <div key={process.id} className="process-item">
            <div className="process-header">
              <h4>{process.processName} ({process.processCode})</h4>
              <div className="process-actions">
                {hasAnyRole(['Admin', 'Manager']) && (
                  <>
                    <button 
                      onClick={() => {
                        setSelectedProcessId(process.id);
                        setShowStepForm(true);
                      }}
                      className="add-step-btn"
                    >
                      Add Step
                    </button>
                    <button 
                      onClick={() => handleEdit(process)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(process.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            <p>{process.description}</p>
            <p><strong>Department:</strong> {process.department}</p>
            
            {/* Steps */}
            {process.steps && process.steps.length > 0 && (
              <div className="steps-section">
                <h5>Steps:</h5>
                <div className="steps-list">
                  {process.steps
                    .sort((a, b) => a.stepOrder - b.stepOrder)
                    .map(step => (
                      <div key={step.id} className="step-item">
                        <span className="step-order">{step.stepOrder}</span>
                        <div className="step-content">
                          <strong>{step.stepName}</strong>
                          <p>{step.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessManagement;