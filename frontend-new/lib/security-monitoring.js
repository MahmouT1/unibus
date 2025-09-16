import { NextResponse } from 'next/server';
import { getSecureDatabase } from './secure-database.js';

/**
 * Security monitoring and logging system
 */

// Security event types
const SECURITY_EVENTS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGIN_BLOCKED: 'LOGIN_BLOCKED',
  REGISTRATION_SUCCESS: 'REGISTRATION_SUCCESS',
  REGISTRATION_FAILED: 'REGISTRATION_FAILED',
  ATTENDANCE_SCAN: 'ATTENDANCE_SCAN',
  ATTENDANCE_DUPLICATE: 'ATTENDANCE_DUPLICATE',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  DATA_BREACH_ATTEMPT: 'DATA_BREACH_ATTEM',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION'
};

// Security levels
const SECURITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

/**
 * Log security event
 */
export async function logSecurityEvent(eventType, details, level = SECURITY_LEVELS.MEDIUM) {
  try {
    const db = await getSecureDatabase();
    const securityLogs = db.collection('security_logs');
    
    const logEntry = {
      eventType,
      level,
      details,
      timestamp: new Date(),
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown',
      userId: details.userId || null,
      sessionId: details.sessionId || null,
      severity: getSeverityLevel(level),
      resolved: false,
      createdAt: new Date()
    };
    
    await securityLogs.insertOne(logEntry);
    
    // Log to console for immediate monitoring
    console.log(`🔒 Security Event: ${eventType} - ${level} - ${JSON.stringify(details)}`);
    
    // Check for suspicious patterns
    await checkSuspiciousPatterns(eventType, details);
    
  } catch (error) {
    console.error('❌ Failed to log security event:', error);
  }
}

/**
 * Get severity level for security events
 */
function getSeverityLevel(level) {
  switch (level) {
    case SECURITY_LEVELS.LOW:
      return 1;
    case SECURITY_LEVELS.MEDIUM:
      return 2;
    case SECURITY_LEVELS.HIGH:
      return 3;
    case SECURITY_LEVELS.CRITICAL:
      return 4;
    default:
      return 2;
  }
}

/**
 * Check for suspicious patterns
 */
async function checkSuspiciousPatterns(eventType, details) {
  try {
    const db = await getSecureDatabase();
    const securityLogs = db.collection('security_logs');
    
    // Check for multiple failed login attempts
    if (eventType === SECURITY_EVENTS.LOGIN_FAILED) {
      const recentFailures = await securityLogs.countDocuments({
        eventType: SECURITY_EVENTS.LOGIN_FAILED,
        'details.ip': details.ip,
        timestamp: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 minutes
      });
      
      if (recentFailures >= 5) {
        await logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, {
          ...details,
          pattern: 'Multiple failed login attempts',
          count: recentFailures
        }, SECURITY_LEVELS.HIGH);
      }
    }
    
    // Check for rate limit violations
    if (eventType === SECURITY_EVENTS.RATE_LIMIT_EXCEEDED) {
      const recentViolations = await securityLogs.countDocuments({
        eventType: SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
        'details.ip': details.ip,
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
      });
      
      if (recentViolations >= 10) {
        await logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, {
          ...details,
          pattern: 'Excessive rate limit violations',
          count: recentViolations
        }, SECURITY_LEVELS.HIGH);
      }
    }
    
    // Check for unauthorized access attempts
    if (eventType === SECURITY_EVENTS.UNAUTHORIZED_ACCESS) {
      const recentUnauthorized = await securityLogs.countDocuments({
        eventType: SECURITY_EVENTS.UNAUTHORIZED_ACCESS,
        'details.ip': details.ip,
        timestamp: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
      });
      
      if (recentUnauthorized >= 3) {
        await logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, {
          ...details,
          pattern: 'Multiple unauthorized access attempts',
          count: recentUnauthorized
        }, SECURITY_LEVELS.CRITICAL);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to check suspicious patterns:', error);
  }
}

/**
 * Get security dashboard data
 */
export async function getSecurityDashboard() {
  try {
    const db = await getSecureDatabase();
    const securityLogs = db.collection('security_logs');
    
    // Get recent security events
    const recentEvents = await securityLogs.find({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).sort({ timestamp: -1 }).limit(100).toArray();
    
    // Get event counts by type
    const eventCounts = await securityLogs.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    // Get severity distribution
    const severityDistribution = await securityLogs.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    // Get top IP addresses
    const topIPs = await securityLogs.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$ip',
          count: { $sum: 1 },
          lastActivity: { $max: '$timestamp' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]).toArray();
    
    // Get suspicious activities
    const suspiciousActivities = await securityLogs.find({
      eventType: SECURITY_EVENTS.SUSPICIOUS_ACTIVITY,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).sort({ timestamp: -1 }).limit(20).toArray();
    
    return {
      recentEvents,
      eventCounts,
      severityDistribution,
      topIPs,
      suspiciousActivities,
      totalEvents: recentEvents.length,
      criticalEvents: recentEvents.filter(e => e.level === SECURITY_LEVELS.CRITICAL).length,
      highEvents: recentEvents.filter(e => e.level === SECURITY_LEVELS.HIGH).length
    };
    
  } catch (error) {
    console.error('❌ Failed to get security dashboard:', error);
    throw error;
  }
}

/**
 * Get security alerts
 */
export async function getSecurityAlerts() {
  try {
    const db = await getSecureDatabase();
    const securityLogs = db.collection('security_logs');
    
    // Get unresolved critical and high severity events
    const alerts = await securityLogs.find({
      level: { $in: [SECURITY_LEVELS.CRITICAL, SECURITY_LEVELS.HIGH] },
      resolved: false,
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).sort({ timestamp: -1 }).limit(50).toArray();
    
    return alerts;
    
  } catch (error) {
    console.error('❌ Failed to get security alerts:', error);
    throw error;
  }
}

/**
 * Resolve security alert
 */
export async function resolveSecurityAlert(alertId, resolution) {
  try {
    const db = await getSecureDatabase();
    const securityLogs = db.collection('security_logs');
    
    await securityLogs.updateOne(
      { _id: alertId },
      {
        $set: {
          resolved: true,
          resolvedAt: new Date(),
          resolution
        }
      }
    );
    
    console.log(`✅ Security alert resolved: ${alertId}`);
    
  } catch (error) {
    console.error('❌ Failed to resolve security alert:', error);
    throw error;
  }
}

/**
 * Get security statistics
 */
export async function getSecurityStatistics() {
  try {
    const db = await getSecureDatabase();
    const securityLogs = db.collection('security_logs');
    
    // Get statistics for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const stats = await securityLogs.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          criticalEvents: {
            $sum: {
              $cond: [{ $eq: ['$level', SECURITY_LEVELS.CRITICAL] }, 1, 0]
            }
          },
          highEvents: {
            $sum: {
              $cond: [{ $eq: ['$level', SECURITY_LEVELS.HIGH] }, 1, 0]
            }
          },
          mediumEvents: {
            $sum: {
              $cond: [{ $eq: ['$level', SECURITY_LEVELS.MEDIUM] }, 1, 0]
            }
          },
          lowEvents: {
            $sum: {
              $cond: [{ $eq: ['$level', SECURITY_LEVELS.LOW] }, 1, 0]
            }
          },
          resolvedEvents: {
            $sum: {
              $cond: ['$resolved', 1, 0]
            }
          }
        }
      }
    ]).toArray();
    
    return stats[0] || {
      totalEvents: 0,
      criticalEvents: 0,
      highEvents: 0,
      mediumEvents: 0,
      lowEvents: 0,
      resolvedEvents: 0
    };
    
  } catch (error) {
    console.error('❌ Failed to get security statistics:', error);
    throw error;
  }
}

/**
 * Export security logs
 */
export async function exportSecurityLogs(startDate, endDate, format = 'json') {
  try {
    const db = await getSecureDatabase();
    const securityLogs = db.collection('security_logs');
    
    const logs = await securityLogs.find({
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ timestamp: -1 }).toArray();
    
    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(logs);
      return csv;
    }
    
    return logs;
    
  } catch (error) {
    console.error('❌ Failed to export security logs:', error);
    throw error;
  }
}

/**
 * Convert logs to CSV format
 */
function convertToCSV(logs) {
  if (logs.length === 0) return '';
  
  const headers = Object.keys(logs[0]);
  const csvRows = [headers.join(',')];
  
  for (const log of logs) {
    const values = headers.map(header => {
      const value = log[header];
      if (typeof value === 'object') {
        return JSON.stringify(value).replace(/"/g, '""');
      }
      return `"${value}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Clean old security logs
 */
export async function cleanOldSecurityLogs(daysToKeep = 90) {
  try {
    const db = await getSecureDatabase();
    const securityLogs = db.collection('security_logs');
    
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const result = await securityLogs.deleteMany({
      timestamp: { $lt: cutoffDate },
      level: { $in: [SECURITY_LEVELS.LOW, SECURITY_LEVELS.MEDIUM] }
    });
    
    console.log(`✅ Cleaned ${result.deletedCount} old security logs`);
    return result.deletedCount;
    
  } catch (error) {
    console.error('❌ Failed to clean old security logs:', error);
    throw error;
  }
}

/**
 * Security monitoring middleware
 */
export function securityMonitoringMiddleware(handler) {
  return async (request) => {
    const startTime = Date.now();
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;
      
      // Log successful request
      if (response.status < 400) {
        await logSecurityEvent(SECURITY_EVENTS.LOGIN_SUCCESS, {
          ip,
          userAgent,
          duration,
          status: response.status,
          path: request.nextUrl.pathname
        }, SECURITY_LEVELS.LOW);
      }
      
      return response;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log error
      await logSecurityEvent(SECURITY_EVENTS.SYSTEM_ERROR, {
        ip,
        userAgent,
        duration,
        error: error.message,
        path: request.nextUrl.pathname
      }, SECURITY_LEVELS.HIGH);
      
      throw error;
    }
  };
}

export { SECURITY_EVENTS, SECURITY_LEVELS };
