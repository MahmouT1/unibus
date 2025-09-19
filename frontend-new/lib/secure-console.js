/**
 * Secure console - DISABLED for debugging
 */

// Simple function that does nothing - security disabled
export function initializeSecureConsole() {
  console.log('🔓 Console security disabled for debugging');
  // Do nothing - let console work normally
}

// Export empty functions
export function secureLog() {}
export function secureWarn() {}
export function secureError() {}