// Client-side token refresh utility

export async function refreshToken() {
  try {
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken) {
      throw new Error('No token found');
    }

    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentToken }),
    });

    const data = await response.json();

    if (data.success) {
      // Update localStorage with new token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.student) {
        localStorage.setItem('student', JSON.stringify(data.student));
      } else {
        localStorage.removeItem('student');
      }

      return {
        success: true,
        user: data.user,
        student: data.student
      };
    } else {
      throw new Error(data.message || 'Token refresh failed');
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // If refresh fails, clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student');
    
    return {
      success: false,
      error: error.message
    };
  }
}

export async function checkAndRefreshToken() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return { success: false, error: 'No token found' };
    }

    // Check if token is expired or about to expire
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = tokenData.exp - currentTime;

    // Refresh if token expires in less than 1 hour
    if (timeUntilExpiry < 3600) {
      return await refreshToken();
    }

    return { success: true, message: 'Token is still valid' };
  } catch (error) {
    console.error('Token check error:', error);
    return { success: false, error: error.message };
  }
}

export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function getCurrentToken() {
  return localStorage.getItem('token');
}

export function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('student');
}

export function isAuthenticated() {
  const token = getCurrentToken();
  const user = getCurrentUser();
  return !!(token && user);
}

export function hasRole(requiredRole) {
  const user = getCurrentUser();
  return user && user.role === requiredRole;
}

export function hasAnyRole(requiredRoles) {
  const user = getCurrentUser();
  return user && requiredRoles.includes(user.role);
}
