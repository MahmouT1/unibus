// API Configuration
const API_CONFIG = {
  // Use proxy routes to avoid CSP issues
  BACKEND_URL: '',
  
  // API Endpoints (using proxy routes)
  ENDPOINTS: {
    // Authentication
    LOGIN: '/api/proxy/auth/login',
    REGISTER: '/api/proxy/auth/register',
    CHECK_USER: '/api/proxy/auth/check-user',
    
    // Admin
    ADMIN_DASHBOARD: '/api/admin/dashboard',
    ADMIN_USERS: '/api/admin/users',
    ADMIN_STATS: '/api/admin/stats',
    
    // Students
    STUDENTS: '/api/students',
    STUDENT_PROFILE: '/api/students/profile',
    
    // Attendance
    ATTENDANCE: '/api/attendance',
    ATTENDANCE_RECORD: '/api/attendance/record',
    
    // Transportation
    TRANSPORTATION: '/api/transportation',
    TRANSPORTATION_SCHEDULE: '/api/transportation/schedule',
    
    // Subscriptions
    SUBSCRIPTIONS: '/api/subscriptions'
  }
};

// Helper function to build full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
};

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    console.log(`🌐 API Call: ${options.method || 'GET'} ${url}`);
    console.log(`📋 Request Options:`, mergedOptions);
    const response = await fetch(url, mergedOptions);
    const data = await response.json();
    
    console.log(`📡 API Response: ${response.status}`, data);
    
    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('❌ API Call Error:', error);
    return {
      ok: false,
      status: 500,
      data: {
        success: false,
        message: 'Network error. Please check if the backend server is running.'
      }
    };
  }
};

export default API_CONFIG;
