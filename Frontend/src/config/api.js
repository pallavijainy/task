/**
 * Centralized API Configuration
 * 
 * This file contains the single source of truth for all backend API configurations.
 * All API calls throughout the application should use these constants.
 */

/**
 * Base URL for the backend API
 * 
 * Priority:
 * 1. Environment variable (VITE_API_BASE_URL)
 * 2. Fallback to production URL
 * 
 * For local development, set VITE_API_BASE_URL in .env file:
 * VITE_API_BASE_URL=http://localhost:3000
 * 
 * For production deployment, set in hosting platform environment variables.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://task-2-7vlb.onrender.com';

/**
 * Full API URL with /api path
 * Use this for RTK Query baseQuery configurations
 */
export const API_URL = `${API_BASE_URL}/api`;

/**
 * API endpoint paths
 * Centralized endpoint constants for consistency
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  
  // User endpoints
  USERS: {
    ALL: '/users/all',
    TEAM: '/users/team',
    BY_ID: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },
  
  // Attendance endpoints
  ATTENDANCE: {
    MY: '/attendance/my',
    TODAY: '/attendance/today',
    ALL: '/attendance/all',
    TEAM: '/attendance/team',
    PUNCH_IN: '/attendance/punch-in',
    PUNCH_OUT: '/attendance/punch-out',
    VALIDATE: (id) => `/attendance/validate/${id}`,
  },
  
  // Overtime endpoints
  OVERTIME: {
    MY: '/overtime/my',
    ALL: '/overtime/all',
    PENDING: '/overtime/pending',
    CREATE: '/overtime',
    APPROVE: (id) => `/overtime/${id}/approve`,
    REJECT: (id) => `/overtime/${id}/reject`,
  },
};

/**
 * Helper function to get authorization headers
 * @returns {Object} Headers object with authorization token
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Helper function to prepare headers for fetch requests
 * @param {Object} customHeaders - Additional headers to merge
 * @returns {Object} Complete headers object
 */
export const prepareHeaders = (customHeaders = {}) => {
  return {
    ...getAuthHeaders(),
    ...customHeaders,
  };
};

export default {
  API_BASE_URL,
  API_URL,
  API_ENDPOINTS,
  getAuthHeaders,
  prepareHeaders,
};
