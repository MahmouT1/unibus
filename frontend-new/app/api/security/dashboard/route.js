import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/secure-api-wrapper.js';
import { getSecurityDashboard, getSecurityAlerts, getSecurityStatistics } from '@/lib/security-monitoring.js';

/**
 * Security dashboard endpoint for monitoring system security
 * Accessible only by admin users
 */

export const GET = withAdminAuth(async (request) => {
  try {
    // Get security dashboard data
    const dashboardData = await getSecurityDashboard();
    
    // Get security alerts
    const alerts = await getSecurityAlerts();
    
    // Get security statistics
    const statistics = await getSecurityStatistics();
    
    // Calculate security score
    const securityScore = calculateSecurityScore(dashboardData, statistics);
    
    // Get system health
    const systemHealth = await getSystemHealth();
    
    return NextResponse.json({
      success: true,
      data: {
        dashboard: dashboardData,
        alerts,
        statistics,
        securityScore,
        systemHealth,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Security dashboard error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to load security dashboard',
      error: error.message
    }, { status: 500 });
  }
});

/**
 * Calculate security score based on various metrics
 */
function calculateSecurityScore(dashboardData, statistics) {
  try {
    let score = 100;
    
    // Deduct points for critical events
    score -= dashboardData.criticalEvents * 10;
    
    // Deduct points for high severity events
    score -= dashboardData.highEvents * 5;
    
    // Deduct points for suspicious activities
    score -= dashboardData.suspiciousActivities.length * 3;
    
    // Deduct points for unresolved alerts
    const unresolvedAlerts = dashboardData.alerts?.filter(alert => !alert.resolved).length || 0;
    score -= unresolvedAlerts * 2;
    
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    // Determine security level
    let level = 'EXCELLENT';
    if (score < 90) level = 'GOOD';
    if (score < 80) level = 'FAIR';
    if (score < 70) level = 'POOR';
    if (score < 60) level = 'CRITICAL';
    
    return {
      score,
      level,
      recommendations: getSecurityRecommendations(score, dashboardData, statistics)
    };
    
  } catch (error) {
    console.error('Security score calculation error:', error);
    return {
      score: 0,
      level: 'UNKNOWN',
      recommendations: ['Unable to calculate security score']
    };
  }
}

/**
 * Get security recommendations based on current status
 */
function getSecurityRecommendations(score, dashboardData, statistics) {
  const recommendations = [];
  
  if (score < 90) {
    recommendations.push('Review and resolve critical security events');
  }
  
  if (dashboardData.criticalEvents > 0) {
    recommendations.push('Address critical security events immediately');
  }
  
  if (dashboardData.suspiciousActivities.length > 5) {
    recommendations.push('Investigate suspicious activities');
  }
  
  if (statistics.criticalEvents > 10) {
    recommendations.push('Implement additional security measures');
  }
  
  if (dashboardData.topIPs.some(ip => ip.count > 100)) {
    recommendations.push('Review high-activity IP addresses');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Security status is good. Continue monitoring.');
  }
  
  return recommendations;
}

/**
 * Get system health status
 */
async function getSystemHealth() {
  try {
    const { getDatabaseHealth } = await import('@/lib/secure-database.js');
    const dbHealth = await getDatabaseHealth();
    
    return {
      database: dbHealth,
      timestamp: new Date().toISOString(),
      status: dbHealth.status === 'connected' ? 'healthy' : 'unhealthy'
    };
    
  } catch (error) {
    console.error('System health check error:', error);
    return {
      database: { status: 'error', message: error.message },
      timestamp: new Date().toISOString(),
      status: 'unhealthy'
    };
  }
}
