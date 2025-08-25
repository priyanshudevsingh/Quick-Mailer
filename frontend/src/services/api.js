import axios from 'axios';

// Support both local development and production serverless deployment
const getApiBaseUrl = () => {
  // Check for Vercel environment
  if (import.meta.env.VITE_VERCEL_ENV === 'production') {
    return import.meta.env.VITE_API_URL || 'https://your-api-gateway-url.amazonaws.com/prod/api';
  }
  
  // Local development
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🌐 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for Lambda cold starts
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
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
  getGoogleAuthURL: () => {
    return api.get('/auth/google/url');
  },
  googleLogin: (idToken) => api.post('/auth/google', { idToken }),
  getProfile: () => api.get('/auth/profile'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Templates API
export const templatesAPI = {
  getAll: () => api.get('/templates'),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAll: () => api.get('/attachments'),
  download: (id) => api.get(`/attachments/${id}/download`, {
    responseType: 'blob',
  }),
  update: (id, data) => api.put(`/attachments/${id}`, data),
  delete: (id) => api.delete(`/attachments/${id}`),
};

// Email API
export const emailAPI = {
  sendEmail: (data) => api.post('/email/send', data),
  saveAsDraft: (data) => api.post('/email/draft', data),
  generateMassEmailTemplate: (templateId) => api.get(`/email/mass-email/template/${templateId}`, {
    responseType: 'blob'
  }),
  sendMassEmail: (templateId, attachmentIds, excelFile) => {
    const formData = new FormData();
    formData.append('templateId', templateId);
    if (attachmentIds && attachmentIds.length > 0) {
      attachmentIds.forEach(id => formData.append('attachmentIds', id));
    }
    formData.append('excelFile', excelFile);
    
    return api.post('/email/mass-email', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  saveMassEmailAsDrafts: (templateId, attachmentIds, excelFile) => {
    const formData = new FormData();
    formData.append('templateId', templateId);
    if (attachmentIds && attachmentIds.length > 0) {
      attachmentIds.forEach(id => formData.append('attachmentIds', id));
    }
    formData.append('excelFile', excelFile);
    
    return api.post('/email/mass-email/drafts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getHistory: () => api.get('/email/history'),
};

// Stats API
export const statsAPI = {
  getDashboardStats: () => api.get('/stats/dashboard'),
};

export default api;
