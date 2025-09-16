/**
 * Secure initialization script
 * Prevents sensitive information from appearing in console
 */

import { initializeSecureConsole } from './secure-console.js';

// Initialize secure console on page load
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSecureConsole);
  } else {
    initializeSecureConsole();
  }
}

// Initialize secure logging for server-side
if (typeof process !== 'undefined') {
  import('./secure-logging.js').then(({ initializeSecureLogging }) => {
    initializeSecureLogging();
  });
}
