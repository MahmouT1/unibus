// Concurrent QR Scanning System
// Handles multiple supervisors scanning simultaneously without conflicts

class ConcurrentScanningManager {
  constructor() {
    this.scanQueue = new Map(); // studentId -> scan requests
    this.processingScans = new Set(); // currently processing student IDs
    this.rateLimiter = new Map(); // supervisorId -> request timestamps
    this.maxConcurrentScans = 10; // Maximum concurrent scans
    this.rateLimitWindow = 1000; // 1 second window
    this.maxRequestsPerWindow = 5; // Max requests per supervisor per window
  }

  // Check if supervisor is within rate limits
  isRateLimited(supervisorId) {
    const now = Date.now();
    const supervisorRequests = this.rateLimiter.get(supervisorId) || [];
    
    // Remove old requests outside the window
    const validRequests = supervisorRequests.filter(
      timestamp => now - timestamp < this.rateLimitWindow
    );
    
    this.rateLimiter.set(supervisorId, validRequests);
    
    return validRequests.length >= this.maxRequestsPerWindow;
  }

  // Add request to rate limiter
  addRequest(supervisorId) {
    const now = Date.now();
    const supervisorRequests = this.rateLimiter.get(supervisorId) || [];
    supervisorRequests.push(now);
    this.rateLimiter.set(supervisorId, supervisorRequests);
  }

  // Queue a scan request
  async queueScanRequest(scanData) {
    const { studentId, supervisorId, qrData, appointmentSlot, stationInfo } = scanData;
    
    // Check rate limiting
    if (this.isRateLimited(supervisorId)) {
      throw new Error('Rate limit exceeded. Please wait before scanning again.');
    }

    // Check if already processing this student
    if (this.processingScans.has(studentId)) {
      throw new Error('Student is already being processed by another supervisor.');
    }

    // Check concurrent scan limit
    if (this.processingScans.size >= this.maxConcurrentScans) {
      throw new Error('System is busy. Please try again in a moment.');
    }

    // Add to processing set
    this.processingScans.add(studentId);
    this.addRequest(supervisorId);

    try {
      // Process the scan
      const result = await this.processScan(scanData);
      return result;
    } finally {
      // Remove from processing set
      this.processingScans.delete(studentId);
    }
  }

  // Process the actual scan
  async processScan(scanData) {
    const { studentId, supervisorId, qrData, appointmentSlot, stationInfo } = scanData;
    
    // Check for existing attendance in database
    const existingAttendance = await this.checkExistingAttendance(studentId, appointmentSlot);
    
    if (existingAttendance) {
      return {
        success: false,
        message: 'Attendance already registered for this slot today',
        attendance: existingAttendance,
        isDuplicate: true
      };
    }

    // Create attendance record
    const attendanceRecord = await this.createAttendanceRecord(scanData);
    
    return {
      success: true,
      message: 'Attendance registered successfully',
      attendance: attendanceRecord,
      isDuplicate: false
    };
  }

  // Check for existing attendance
  async checkExistingAttendance(studentId, appointmentSlot) {
    try {
      const response = await fetch('/api/attendance/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          appointmentSlot,
          date: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.exists ? result.attendance : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking existing attendance:', error);
      return null;
    }
  }

  // Create attendance record
  async createAttendanceRecord(scanData) {
    try {
      const response = await fetch('/api/attendance/register-concurrent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scanData)
      });

      if (response.ok) {
        const result = await response.json();
        return result.attendance;
      }
      
      throw new Error('Failed to create attendance record');
    } catch (error) {
      console.error('Error creating attendance record:', error);
      throw error;
    }
  }

  // Get system status
  getSystemStatus() {
    return {
      activeScans: this.processingScans.size,
      maxConcurrentScans: this.maxConcurrentScans,
      queueSize: this.scanQueue.size,
      isHealthy: this.processingScans.size < this.maxConcurrentScans
    };
  }

  // Clear old rate limit data
  cleanup() {
    const now = Date.now();
    for (const [supervisorId, requests] of this.rateLimiter.entries()) {
      const validRequests = requests.filter(
        timestamp => now - timestamp < this.rateLimitWindow
      );
      
      if (validRequests.length === 0) {
        this.rateLimiter.delete(supervisorId);
      } else {
        this.rateLimiter.set(supervisorId, validRequests);
      }
    }
  }
}

// Global instance
const scanningManager = new ConcurrentScanningManager();

// Cleanup every 30 seconds
setInterval(() => {
  scanningManager.cleanup();
}, 30000);

export default scanningManager;
