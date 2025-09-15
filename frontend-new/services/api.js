// src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
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

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

// Authentication API
export const authAPI = {
    login: async (credentials) => {
        // Try admin login first, then student login
        try {
            const response = await api.post('/auth/login-admin', credentials);
            if (response.success && response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                if (response.student) {
                    localStorage.setItem('student', JSON.stringify(response.student));
                }
                return response;
            }
        } catch (error) {
            // If admin login fails, try simple student login
            try {
                const response = await api.post('/auth/login-simple', credentials);
                if (response.success && response.token) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.user));
                    if (response.student) {
                        localStorage.setItem('student', JSON.stringify(response.student));
                    }
                    return response;
                }
            } catch (studentError) {
                throw studentError;
            }
        }
        throw new Error('Login failed');
    },

    register: async (userData) => {
        const response = await api.post('/auth/register-simple', userData);
        if (response.success && response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            if (response.student) {
                localStorage.setItem('student', JSON.stringify(response.student));
            }
        }
        return response;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('student');
        }
    },

    getCurrentUser: async () => {
        return await api.get('/auth/me');
    },

    changePassword: async (passwordData) => {
        return await api.put('/auth/change-password', passwordData);
    }
};

// Student API
export const studentAPI = {
    getProfile: async () => {
        return await api.get('/students/profile-simple');
    },

    updateProfile: async (profileData) => {
        return await api.put('/students/profile-simple', profileData);
    },

    uploadProfilePhoto: async (file) => {
        const formData = new FormData();
        formData.append('profilePhoto', file);
        
        return await api.post('/students/profile/photo', formData, {
            timeout: 30000, // 30 second timeout for file uploads
            headers: {
                // Don't set Content-Type - let browser set it with boundary
            },
        });
    },

    generateQRCode: async () => {
        return await api.post('/students/generate-qr');
    },

    getAttendance: async (params = {}) => {
        return await api.get('/students/attendance', { params });
    },

    submitSupportTicket: async (ticketData) => {
        return await api.post('/students/support', ticketData);
    },

    getSupportTickets: async () => {
        return await api.get('/students/support');
    }
};

// Subscription API
export const subscriptionAPI = {
    getMySubscription: async () => {
        return await api.get('/subscriptions/my-subscription');
    },

    requestSubscription: async (subscriptionData) => {
        return await api.post('/subscriptions/request', subscriptionData);
    },

    getApplications: async (params = {}) => {
        return await api.get('/subscriptions/applications', { params });
    },

    confirmSubscription: async (subscriptionId, confirmationData) => {
        return await api.put(`/subscriptions/confirm/${subscriptionId}`, confirmationData);
    },

    cancelSubscription: async (subscriptionId) => {
        return await api.put(`/subscriptions/cancel/${subscriptionId}`);
    },

    processPayment: async (subscriptionId, paymentData) => {
        return await api.post(`/subscriptions/payment/${subscriptionId}`, paymentData);
    },

    getStats: async () => {
        return await api.get('/subscriptions/stats');
    }
};

// Attendance API
export const attendanceAPI = {
    scanQR: async (qrData) => {
        return await api.post('/attendance/scan-qr', qrData);
    },

    getRecords: async (params = {}) => {
        return await api.get('/attendance/records', { params });
    },

    getTodayAttendance: async () => {
        return await api.get('/attendance/today');
    },

    markAbsent: async (attendanceData) => {
        return await api.post('/attendance/mark-absent', attendanceData);
    },

    updateRecord: async (attendanceId, updateData) => {
        return await api.put(`/attendance/update/${attendanceId}`, updateData);
    },

    getStats: async (params = {}) => {
        return await api.get('/attendance/stats', { params });
    }
};

// Transportation API
export const transportationAPI = {
    getSchedule: async () => {
        return await api.get('/transportation/schedule');
    },

    updateSchedule: async (scheduleData) => {
        return await api.put('/transportation/schedule', scheduleData);
    },

    setReturnSchedule: async (returnData) => {
        return await api.post('/transportation/return-schedule', returnData);
    }
};

// Admin API
export const adminAPI = {
    getDashboardStats: async () => {
        return await api.get('/admin/dashboard/stats');
    },

    getStudents: async (params = {}) => {
        return await api.get('/admin/students', { params });
    },

    getStudentDetails: async (studentId) => {
        return await api.get(`/admin/students/${studentId}`);
    },

    updateStudentStatus: async (studentId, statusData) => {
        return await api.put(`/admin/students/${studentId}/status`, statusData);
    },

    getSupportTickets: async (params = {}) => {
        return await api.get('/admin/support-tickets', { params });
    },

    updateSupportTicket: async (ticketId, updateData) => {
        return await api.put(`/admin/support-tickets/${ticketId}`, updateData);
    },

    generateReport: async (reportType, params = {}) => {
        return await api.get(`/admin/reports/${reportType}`, { params });
    }
};

// Utility functions
export const getStoredUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const getStoredStudent = () => {
    const student = localStorage.getItem('student');
    return student ? JSON.parse(student) : null;
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export default api;