import axios from 'axios';

const API_BASE_URL = 'http://localhost:5103/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm JWT token vào headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor để xử lý lỗi authentication
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/Auth/register', userData),
  login: (loginData) => api.post('/Auth/login', loginData),
  getUser: (id) => api.get(`/Auth/${id}`),
};

// Process Error API
export const processErrorAPI = {
  getAll: () => api.get('/ProcessError'),
  getById: (id) => api.get(`/ProcessError/${id}`),
  create: (errorData) => api.post('/ProcessError', errorData),
  update: (id, errorData) => api.put(`/ProcessError/${id}`, errorData),
  delete: (id) => api.delete(`/ProcessError/${id}`),
  assign: (id, assignData) => api.post(`/ProcessError/${id}/assign`, assignData),
  addComment: (id, comment) => api.post(`/ProcessError/${id}/comments`, comment),
  uploadAttachment: (id, formData) => api.post(`/ProcessError/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Production Process API
export const productionProcessAPI = {
  getAll: () => api.get('/ProductionProcess'),
  getById: (id) => api.get(`/ProductionProcess/${id}`),
  create: (processData) => api.post('/ProductionProcess', processData),
  update: (id, processData) => api.put(`/ProductionProcess/${id}`, processData),
  delete: (id) => api.delete(`/ProductionProcess/${id}`),
  addStep: (id, stepData) => api.post(`/ProductionProcess/${id}/steps`, stepData),
};

// User API
export const userAPI = {
  getAll: () => api.get('/User'),
  getById: (id) => api.get(`/User/${id}`),
  getEmployees: () => api.get('/User/employees'),
  update: (id, userData) => api.put(`/User/${id}`, userData),
  delete: (id) => api.delete(`/User/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getDashboard: () => api.get('/Dashboard'),
  getReport: (params) => api.get('/Dashboard/report', { params }),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/Notification'),
  getUnread: () => api.get('/Notification/unread'),
  getUnreadCount: () => api.get('/Notification/count'),
  markAsRead: (id) => api.post(`/Notification/${id}/read`),
  markAllAsRead: () => api.post('/Notification/read-all'),
  delete: (id) => api.delete(`/Notification/${id}`),
};

// Audit Log API
export const auditLogAPI = {
  getAll: (params) => api.get('/AuditLog', { params }),
  getById: (id) => api.get(`/AuditLog/${id}`),
  getEntityLogs: (entityType, entityId) => api.get(`/AuditLog/entity/${entityType}/${entityId}`),
};

export default api;