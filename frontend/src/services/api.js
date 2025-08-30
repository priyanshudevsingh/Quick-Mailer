import axios from 'axios';

// Support both local development and production serverless deployment
// Updated for serverless deployment with proper /api prefix
const getApiBaseUrl = () => {
  // Check for Vercel environment
  if (import.meta.env.VITE_VERCEL_ENV === 'production') {
    return import.meta.env.VITE_API_URL || 'https://your-api-gateway-url.amazonaws.com';
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
    return api.get('/api/auth/google/url');
  },
  googleLogin: (idToken) => api.post('/api/auth/google', { idToken }),
  getProfile: () => api.get('/api/auth/profile'),
  refreshToken: () => api.post('/api/auth/refresh'),
};

// Templates API
export const templatesAPI = {
  getAll: () => api.get('/api/templates'),
  getById: (id) => api.get(`/api/templates/${id}`),
  create: (data) => api.post('/api/templates', data),
  update: (id, data) => api.put(`/api/templates/${id}`, data),
  delete: (id) => api.delete(`/api/templates/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAll: () => api.get('/api/attachments'),
  download: (id) => api.get(`/api/attachments/${id}/download`, {
    responseType: 'blob',
  }),
  update: (id, data) => api.put(`/api/attachments/${id}`, data),
  delete: (id) => api.delete(`/api/attachments/${id}`),
};

// Email API
export const emailAPI = {
  sendEmail: (data) => api.post('/api/email/send', data),
  saveAsDraft: (data) => api.post('/api/email/draft', data),
  generateMassEmailTemplate: (templateId) => api.get(`/api/email/mass-email/template/${templateId}`, {
    responseType: 'blob'
  }),
  sendMassEmail: (templateId, attachmentIds, excelFile) => {
    const formData = new FormData();
    formData.append('templateId', templateId);
    if (attachmentIds && attachmentIds.length > 0) {
      formData.append('attachmentIds', JSON.stringify(attachmentIds));
    }
    if (excelFile) {
      formData.append('excelFile', excelFile);
    }
    return api.post('/api/email/mass-email', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  saveMassEmailAsDrafts: (templateId, attachmentIds, excelFile) => {
    const formData = new FormData();
    formData.append('templateId', templateId);
    if (attachmentIds && attachmentIds.length > 0) {
      formData.append('attachmentIds', JSON.stringify(attachmentIds));
    }
    if (excelFile) {
      formData.append('excelFile', excelFile);
    }
    return api.post('/api/email/mass-email/drafts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getDrafts: () => api.get('/api/email/drafts'),
  getDraftById: (id) => api.get(`/api/email/drafts/${id}`),
  updateDraft: (id, data) => api.put(`/api/email/drafts/${id}`, data),
  deleteDraft: (id) => api.delete(`/api/email/drafts/${id}`),
};



export default api;
