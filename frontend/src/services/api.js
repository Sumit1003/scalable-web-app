import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://scalable-web-app.onrender.com/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request for debugging
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data
        });

        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        return response;
    },
    (error) => {
        console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - Error:`, {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });

        if (error.response?.status === 401) {
            console.log('🔒 Unauthorized - redirecting to login');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// Utility function to clean parameters (remove empty values)
const cleanParams = (params) => {
    if (!params) return {};

    const cleaned = {};
    Object.keys(params).forEach(key => {
        const value = params[key];
        // Keep only non-empty, non-null, non-undefined values
        if (value !== '' && value !== null && value !== undefined) {
            cleaned[key] = value;
        }
    });
    return cleaned;
};

// Auth API
export const authAPI = {
    login: (credentials) => {
        console.log('🔐 Login attempt:', { email: credentials.email });
        return api.post('/auth/login', credentials);
    },

    register: (userData) => {
        console.log('👤 Register attempt:', { name: userData.name, email: userData.email });
        return api.post('/auth/register', userData);
    },

    getMe: () => {
        console.log('📋 Getting current user');
        return api.get('/auth/me');
    },

    setToken: (token) => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('🔑 Token set in headers');
        } else {
            delete api.defaults.headers.common['Authorization'];
            console.log('🔑 Token removed from headers');
        }
    }
};

// Tasks API
export const tasksAPI = {
    getAll: (params = {}) => {
        const cleanedParams = cleanParams(params);
        console.log('📋 Fetching tasks with params:', cleanedParams);
        return api.get('/tasks', { params: cleanedParams });
    },

    getById: (id) => {
        console.log('📋 Fetching task by ID:', id);
        return api.get(`/tasks/${id}`);
    },

    create: (taskData) => {
        console.log('➕ Creating task:', taskData);
        return api.post('/tasks', taskData);
    },

    update: (id, taskData) => {
        console.log('✏️ Updating task:', id, taskData);
        return api.put(`/tasks/${id}`, taskData);
    },

    delete: (id) => {
        console.log('🗑️ Deleting task:', id);
        return api.delete(`/tasks/${id}`);
    },
};

// Password API
export const passwordAPI = {
    forgot: (data) => {
        console.log('🔑 Forgot password request for:', data.email);
        return api.post('/password/forgot', data);
    },

    reset: (data) => {
        console.log('🔄 Password reset attempt');
        return api.put('/password/reset', data);
    },

    verifyDOB: (data) => {
        console.log('📅 Verifying date of birth for:', data.email);
        return api.post('/password/verify-dob', data);
    },
};

// Users API
export const usersAPI = {
    getProfile: () => {
        console.log('👤 Getting user profile');
        return api.get('/users/profile');
    },

    updateProfile: (userData) => {
        console.log('✏️ Updating user profile:', userData);
        return api.put('/users/profile', userData);
    },
};

// Health check
export const healthAPI = {
    check: () => {
        console.log('🏥 Health check');
        return api.get('/health');
    },
};

// Test connection to backend
export const testConnection = async () => {
    try {
        console.log('🔌 Testing connection to backend...');
        const response = await healthAPI.check();
        console.log('✅ Backend connection successful:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('❌ Backend connection failed:', error.message);
        return {
            success: false,
            error: error.message,
            details: error.response?.data
        };
    }
};

// Test authentication
export const testAuth = async () => {
    try {
        console.log('🔐 Testing authentication...');
        const response = await authAPI.getMe();
        console.log('✅ Authentication successful:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        return {
            success: false,
            error: error.message,
            details: error.response?.data
        };
    }
};

// Test tasks API
export const testTasksAPI = async () => {
    try {
        console.log('📋 Testing tasks API...');
        const response = await tasksAPI.getAll();
        console.log('✅ Tasks API test successful:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('❌ Tasks API test failed:', error.message);
        return {
            success: false,
            error: error.message,
            details: error.response?.data
        };
    }
};

export default api;