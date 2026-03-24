import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Admin API instance dengan interceptor untuk JWT
const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: sisipkan token ke setiap request
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: handle 401 (token expired)
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginAdmin = async (email, password) => {
  const { data } = await adminApi.post('/login', { email, password });
  return data;
};

// Dashboard
export const getDashboardStats = async (filters = {}) => {
  const { data } = await adminApi.get('/dashboard/stats', { params: filters });
  return data;
};

export const getMuseumsByProvince = async (filters = {}) => {
  const { data } = await adminApi.get('/dashboard/museums-by-province', { params: filters });
  return data;
};

export const getMuseumsByCategory = async (filters = {}) => {
  const { data } = await adminApi.get('/dashboard/museums-by-category', { params: filters });
  return data;
};

export const getTopRegencies = async (filters = {}) => {
  const { data } = await adminApi.get('/dashboard/top-regencies', { params: filters });
  return data;
};

// Museum CRUD
export const getAdminMuseums = async (params = {}) => {
  const { data } = await adminApi.get('/museums', { params });
  return data;
};

export const createMuseum = async (museumData) => {
  const { data } = await adminApi.post('/museums', museumData);
  return data;
};

export const updateMuseum = async (id, museumData) => {
  const { data } = await adminApi.put(`/museums/${id}`, museumData);
  return data;
};

export const deleteMuseum = async (id) => {
  const { data } = await adminApi.delete(`/museums/${id}`);
  return data;
};

export default adminApi;
