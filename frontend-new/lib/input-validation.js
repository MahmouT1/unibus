import { sanitizeInput, sanitizeForDatabase, preventXSS, validateEmail } from './security-middleware.js';

/**
 * Comprehensive input validation and sanitization
 */

/**
 * Validate and sanitize user registration data
 */
export function validateRegistrationData(data) {
  const errors = [];
  const sanitizedData = {};

  // Required fields validation
  const requiredFields = ['fullName', 'email', 'password', 'confirmPassword'];
  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors, data: null };
  }

  // Full name validation
  if (data.fullName) {
    const fullName = sanitizeInput(data.fullName);
    if (fullName.length < 2 || fullName.length > 50) {
      errors.push('Full name must be between 2 and 50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(fullName)) {
      errors.push('Full name can only contain letters and spaces');
    } else {
      sanitizedData.fullName = fullName;
    }
  }

  // Email validation
  if (data.email) {
    const email = sanitizeInput(data.email.toLowerCase());
    if (!validateEmail(email)) {
      errors.push('Invalid email format');
    } else if (email.length > 100) {
      errors.push('Email must be less than 100 characters');
    } else {
      sanitizedData.email = email;
    }
  }

  // Password validation
  if (data.password) {
    if (data.password !== data.confirmPassword) {
      errors.push('Passwords do not match');
    } else if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (!/(?=.*[a-z])/.test(data.password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (!/(?=.*[A-Z])/.test(data.password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (!/(?=.*\d)/.test(data.password)) {
      errors.push('Password must contain at least one number');
    } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(data.password)) {
      errors.push('Password must contain at least one special character');
    } else {
      sanitizedData.password = data.password; // Don't sanitize password
    }
  }

  // Optional fields validation
  if (data.studentId) {
    const studentId = sanitizeInput(data.studentId);
    if (studentId.length < 3 || studentId.length > 20) {
      errors.push('Student ID must be between 3 and 20 characters');
    } else if (!/^[a-zA-Z0-9]+$/.test(studentId)) {
      errors.push('Student ID can only contain letters and numbers');
    } else {
      sanitizedData.studentId = studentId;
    }
  }

  if (data.phoneNumber) {
    const phoneNumber = sanitizeInput(data.phoneNumber);
    if (!/^[\+]?[1-9][\d]{0,15}$/.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Invalid phone number format');
    } else {
      sanitizedData.phoneNumber = phoneNumber;
    }
  }

  if (data.college) {
    const college = sanitizeInput(data.college);
    if (college.length < 2 || college.length > 100) {
      errors.push('College name must be between 2 and 100 characters');
    } else {
      sanitizedData.college = college;
    }
  }

  if (data.grade) {
    const grade = sanitizeInput(data.grade);
    const validGrades = ['first-year', 'second-year', 'third-year', 'fourth-year', 'graduate'];
    if (!validGrades.includes(grade)) {
      errors.push('Invalid grade selection');
    } else {
      sanitizedData.grade = grade;
    }
  }

  if (data.major) {
    const major = sanitizeInput(data.major);
    if (major.length < 2 || major.length > 100) {
      errors.push('Major must be between 2 and 100 characters');
    } else {
      sanitizedData.major = major;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: sanitizedData
  };
}

/**
 * Validate and sanitize login data
 */
export function validateLoginData(data) {
  const errors = [];
  const sanitizedData = {};

  // Email validation
  if (!data.email || data.email.trim() === '') {
    errors.push('Email is required');
  } else {
    const email = sanitizeInput(data.email.toLowerCase());
    if (!validateEmail(email)) {
      errors.push('Invalid email format');
    } else {
      sanitizedData.email = email;
    }
  }

  // Password validation
  if (!data.password || data.password.trim() === '') {
    errors.push('Password is required');
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  } else {
    sanitizedData.password = data.password; // Don't sanitize password
  }

  // Role validation (for admin/supervisor login)
  if (data.role) {
    const validRoles = ['admin', 'supervisor', 'student'];
    if (!validRoles.includes(data.role)) {
      errors.push('Invalid role');
    } else {
      sanitizedData.role = data.role;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: sanitizedData
  };
}

/**
 * Validate and sanitize attendance data
 */
export function validateAttendanceData(data) {
  const errors = [];
  const sanitizedData = {};

  // Student ID validation
  if (!data.studentId || data.studentId.trim() === '') {
    errors.push('Student ID is required');
  } else {
    const studentId = sanitizeForDatabase(data.studentId);
    if (studentId.length < 3 || studentId.length > 20) {
      errors.push('Student ID must be between 3 and 20 characters');
    } else {
      sanitizedData.studentId = studentId;
    }
  }

  // Student email validation
  if (data.studentEmail) {
    const email = sanitizeInput(data.studentEmail.toLowerCase());
    if (!validateEmail(email)) {
      errors.push('Invalid student email format');
    } else {
      sanitizedData.studentEmail = email;
    }
  }

  // Student name validation
  if (data.studentName) {
    const name = sanitizeInput(data.studentName);
    if (name.length < 2 || name.length > 50) {
      errors.push('Student name must be between 2 and 50 characters');
    } else {
      sanitizedData.studentName = name;
    }
  }

  // Supervisor ID validation
  if (data.supervisorId) {
    const supervisorId = sanitizeForDatabase(data.supervisorId);
    if (supervisorId.length < 3 || supervisorId.length > 20) {
      errors.push('Supervisor ID must be between 3 and 20 characters');
    } else {
      sanitizedData.supervisorId = supervisorId;
    }
  }

  // Supervisor name validation
  if (data.supervisorName) {
    const name = sanitizeInput(data.supervisorName);
    if (name.length < 2 || name.length > 50) {
      errors.push('Supervisor name must be between 2 and 50 characters');
    } else {
      sanitizedData.supervisorName = name;
    }
  }

  // Appointment slot validation
  if (data.appointmentSlot) {
    const validSlots = ['first', 'second', 'third', 'morning', 'afternoon', 'evening'];
    if (!validSlots.includes(data.appointmentSlot)) {
      errors.push('Invalid appointment slot');
    } else {
      sanitizedData.appointmentSlot = data.appointmentSlot;
    }
  }

  // Date validation
  if (data.date) {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    } else {
      sanitizedData.date = date;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: sanitizedData
  };
}

/**
 * Validate and sanitize subscription data
 */
export function validateSubscriptionData(data) {
  const errors = [];
  const sanitizedData = {};

  // Student ID validation
  if (!data.studentId || data.studentId.trim() === '') {
    errors.push('Student ID is required');
  } else {
    const studentId = sanitizeForDatabase(data.studentId);
    if (studentId.length < 3 || studentId.length > 20) {
      errors.push('Student ID must be between 3 and 20 characters');
    } else {
      sanitizedData.studentId = studentId;
    }
  }

  // Student email validation
  if (!data.studentEmail || data.studentEmail.trim() === '') {
    errors.push('Student email is required');
  } else {
    const email = sanitizeInput(data.studentEmail.toLowerCase());
    if (!validateEmail(email)) {
      errors.push('Invalid student email format');
    } else {
      sanitizedData.studentEmail = email;
    }
  }

  // Payment method validation
  if (data.paymentMethod) {
    const validMethods = ['cash', 'card', 'bank_transfer', 'online'];
    if (!validMethods.includes(data.paymentMethod)) {
      errors.push('Invalid payment method');
    } else {
      sanitizedData.paymentMethod = data.paymentMethod;
    }
  }

  // Amount validation
  if (data.amount) {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Amount must be a positive number');
    } else if (amount > 100000) {
      errors.push('Amount cannot exceed 100,000');
    } else {
      sanitizedData.amount = amount;
    }
  }

  // Date validation
  if (data.confirmationDate) {
    const date = new Date(data.confirmationDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid confirmation date format');
    } else {
      sanitizedData.confirmationDate = date;
    }
  }

  if (data.renewalDate) {
    const date = new Date(data.renewalDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid renewal date format');
    } else {
      sanitizedData.renewalDate = date;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: sanitizedData
  };
}

/**
 * Validate and sanitize transportation data
 */
export function validateTransportationData(data) {
  const errors = [];
  const sanitizedData = {};

  // Route name validation
  if (!data.routeName || data.routeName.trim() === '') {
    errors.push('Route name is required');
  } else {
    const routeName = sanitizeInput(data.routeName);
    if (routeName.length < 2 || routeName.length > 100) {
      errors.push('Route name must be between 2 and 100 characters');
    } else {
      sanitizedData.routeName = routeName;
    }
  }

  // Departure time validation
  if (!data.departureTime || data.departureTime.trim() === '') {
    errors.push('Departure time is required');
  } else {
    const time = sanitizeInput(data.departureTime);
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      errors.push('Invalid departure time format (HH:MM)');
    } else {
      sanitizedData.departureTime = time;
    }
  }

  // Arrival time validation
  if (!data.arrivalTime || data.arrivalTime.trim() === '') {
    errors.push('Arrival time is required');
  } else {
    const time = sanitizeInput(data.arrivalTime);
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      errors.push('Invalid arrival time format (HH:MM)');
    } else {
      sanitizedData.arrivalTime = time;
    }
  }

  // Location validation
  if (data.location) {
    const location = sanitizeInput(data.location);
    if (location.length < 2 || location.length > 200) {
      errors.push('Location must be between 2 and 200 characters');
    } else {
      sanitizedData.location = location;
    }
  }

  // Map link validation
  if (data.mapLink) {
    const mapLink = sanitizeInput(data.mapLink);
    if (!/^https?:\/\/.+/.test(mapLink)) {
      errors.push('Map link must be a valid URL');
    } else {
      sanitizedData.mapLink = mapLink;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: sanitizedData
  };
}

/**
 * Validate and sanitize QR code data
 */
export function validateQRCodeData(data) {
  const errors = [];
  const sanitizedData = {};

  try {
    const qrData = typeof data === 'string' ? JSON.parse(data) : data;

    // Student ID validation
    if (!qrData.id || qrData.id.trim() === '') {
      errors.push('Student ID is required in QR code');
    } else {
      const studentId = sanitizeForDatabase(qrData.id);
      if (studentId.length < 3 || studentId.length > 20) {
        errors.push('Student ID must be between 3 and 20 characters');
      } else {
        sanitizedData.id = studentId;
      }
    }

    // Student name validation
    if (!qrData.fullName || qrData.fullName.trim() === '') {
      errors.push('Student name is required in QR code');
    } else {
      const name = sanitizeInput(qrData.fullName);
      if (name.length < 2 || name.length > 50) {
        errors.push('Student name must be between 2 and 50 characters');
      } else {
        sanitizedData.fullName = name;
      }
    }

    // Student email validation
    if (qrData.email) {
      const email = sanitizeInput(qrData.email.toLowerCase());
      if (!validateEmail(email)) {
        errors.push('Invalid student email format in QR code');
      } else {
        sanitizedData.email = email;
      }
    }

    // College validation
    if (qrData.college) {
      const college = sanitizeInput(qrData.college);
      if (college.length < 2 || college.length > 100) {
        errors.push('College name must be between 2 and 100 characters');
      } else {
        sanitizedData.college = college;
      }
    }

    // Grade validation
    if (qrData.grade) {
      const grade = sanitizeInput(qrData.grade);
      const validGrades = ['first-year', 'second-year', 'third-year', 'fourth-year', 'graduate'];
      if (!validGrades.includes(grade)) {
        errors.push('Invalid grade in QR code');
      } else {
        sanitizedData.grade = grade;
      }
    }

    // Major validation
    if (qrData.major) {
      const major = sanitizeInput(qrData.major);
      if (major.length < 2 || major.length > 100) {
        errors.push('Major must be between 2 and 100 characters');
      } else {
        sanitizedData.major = major;
      }
    }

  } catch (error) {
    errors.push('Invalid QR code data format');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: sanitizedData
  };
}

/**
 * Validate and sanitize search parameters
 */
export function validateSearchParams(params) {
  const errors = [];
  const sanitizedData = {};

  // Search query validation
  if (params.query) {
    const query = sanitizeForDatabase(params.query);
    if (query.length < 1 || query.length > 100) {
      errors.push('Search query must be between 1 and 100 characters');
    } else {
      sanitizedData.query = query;
    }
  }

  // Page validation
  if (params.page) {
    const page = parseInt(params.page);
    if (isNaN(page) || page < 1 || page > 1000) {
      errors.push('Page must be a number between 1 and 1000');
    } else {
      sanitizedData.page = page;
    }
  }

  // Limit validation
  if (params.limit) {
    const limit = parseInt(params.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push('Limit must be a number between 1 and 100');
    } else {
      sanitizedData.limit = limit;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: sanitizedData
  };
}

/**
 * Validate and sanitize file upload data
 */
export function validateFileUpload(file) {
  const errors = [];
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors, data: null };
  }

  // File type validation
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not allowed. Only JPEG, PNG, GIF, and WebP images are allowed');
  }

  // File size validation
  if (file.size > maxSize) {
    errors.push('File size too large. Maximum size is 5MB');
  }

  // File name validation
  if (file.name) {
    const fileName = sanitizeInput(file.name);
    if (fileName.length < 1 || fileName.length > 255) {
      errors.push('File name must be between 1 and 255 characters');
    } else if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
      errors.push('File name contains invalid characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: file
  };
}
