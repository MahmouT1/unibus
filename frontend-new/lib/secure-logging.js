/**
 * Secure logging system to prevent sensitive information exposure
 */

// Security configuration
const SECURITY_CONFIG = {
  // Sensitive data patterns to redact
  SENSITIVE_PATTERNS: [
    /password/gi,
    /token/gi,
    /secret/gi,
    /key/gi,
    /auth/gi,
    /credential/gi,
    /session/gi,
    /jwt/gi,
    /bearer/gi,
    /api[_-]?key/gi,
    /private[_-]?key/gi,
    /access[_-]?token/gi,
    /refresh[_-]?token/gi,
    /authorization/gi,
    /cookie/gi,
    /sessionid/gi,
    /csrf/gi,
    /xss/gi,
    /sql/gi,
    /injection/gi,
    /hash/gi,
    /salt/gi,
    /encrypt/gi,
    /decrypt/gi,
    /signature/gi,
    /nonce/gi,
    /iv/gi,
    /cipher/gi,
    /algorithm/gi,
    /bcrypt/gi,
    /sha/gi,
    /md5/gi,
    /rsa/gi,
    /aes/gi,
    /des/gi,
    /blowfish/gi,
    /twofish/gi,
    /serpent/gi,
    /camellia/gi,
    /chacha/gi,
    /poly1305/gi,
    /salsa/gi,
    /argon/gi,
    /scrypt/gi,
    /pbkdf/gi,
    /hmac/gi,
    /otp/gi,
    /totp/gi,
    /hotp/gi,
    /mfa/gi,
    /2fa/gi,
    /totp/gi,
    /sms/gi,
    /email/gi,
    /phone/gi,
    /ssn/gi,
    /social[_-]?security/gi,
    /credit[_-]?card/gi,
    /card[_-]?number/gi,
    /cvv/gi,
    /cvc/gi,
    /pin/gi,
    /pwd/gi,
    /pass/gi,
    /login/gi,
    /signin/gi,
    /signup/gi,
    /register/gi,
    /account/gi,
    /profile/gi,
    /personal/gi,
    /private/gi,
    /confidential/gi,
    /sensitive/gi,
    /internal/gi,
    /admin/gi,
    /supervisor/gi,
    /user[_-]?id/gi,
    /student[_-]?id/gi,
    /employee[_-]?id/gi,
    /customer[_-]?id/gi,
    /client[_-]?id/gi,
    /database/gi,
    /connection/gi,
    /uri/gi,
    /url/gi,
    /endpoint/gi,
    /route/gi,
    /path/gi,
    /query/gi,
    /parameter/gi,
    /variable/gi,
    /config/gi,
    /setting/gi,
    /environment/gi,
    /env/gi,
    /process/gi,
    /system/gi,
    /server/gi,
    /host/gi,
    /port/gi,
    /domain/gi,
    /subdomain/gi,
    /ip/gi,
    /address/gi,
    /location/gi,
    /geolocation/gi,
    /gps/gi,
    /coordinates/gi,
    /latitude/gi,
    /longitude/gi,
    /timezone/gi,
    /locale/gi,
    /language/gi,
    /currency/gi,
    /country/gi,
    /region/gi,
    /state/gi,
    /city/gi,
    /zip/gi,
    /postal/gi,
    /street/gi,
    /avenue/gi,
    /road/gi,
    /lane/gi,
    /drive/gi,
    /court/gi,
    /place/gi,
    /boulevard/gi,
    /highway/gi,
    /freeway/gi,
    /interstate/gi,
    /route/gi,
    /way/gi,
    /circle/gi,
    /square/gi,
    /plaza/gi,
    /mall/gi,
    /center/gi,
    /building/gi,
    /apartment/gi,
    /suite/gi,
    /floor/gi,
    /room/gi,
    /office/gi,
    /department/gi,
    /division/gi,
    /branch/gi,
    /unit/gi,
    /section/gi,
    /area/gi,
    /zone/gi,
    /district/gi,
    /ward/gi,
    /precinct/gi,
    /neighborhood/gi,
    /community/gi,
    /village/gi,
    /town/gi,
    /municipality/gi,
    /county/gi,
    /parish/gi,
    /province/gi,
    /territory/gi,
    /colony/gi,
    /dependency/gi,
    /protectorate/gi,
    /mandate/gi,
    /trust/gi,
    /territory/gi,
    /possession/gi,
    /colony/gi,
    /dependency/gi,
    /protectorate/gi,
    /mandate/gi,
    /trust/gi,
    /territory/gi,
    /possession/gi
  ],
  
  // Redaction replacement
  REDACTION_TEXT: '[REDACTED]',
  
  // Log levels
  LOG_LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  },
  
  // Current log level (set to INFO in production)
  CURRENT_LOG_LEVEL: process.env.NODE_ENV === 'production' ? 1 : 3
};

/**
 * Redact sensitive information from data
 */
export function redactSensitiveData(data) {
  if (typeof data === 'string') {
    return redactString(data);
  } else if (typeof data === 'object' && data !== null) {
    return redactObject(data);
  } else if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item));
  }
  return data;
}

/**
 * Redact sensitive information from string
 */
function redactString(str) {
  if (typeof str !== 'string') return str;
  
  let redacted = str;
  
  // Redact JWT tokens
  redacted = redacted.replace(/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[JWT_TOKEN]');
  
  // Redact API keys
  redacted = redacted.replace(/[A-Za-z0-9]{32,}/g, (match) => {
    if (match.length >= 32) return '[API_KEY]';
    return match;
  });
  
  // Redact email addresses
  redacted = redacted.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
  
  // Redact phone numbers
  redacted = redacted.replace(/[\+]?[1-9][\d]{0,15}/g, '[PHONE]');
  
  // Redact credit card numbers
  redacted = redacted.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_NUMBER]');
  
  // Redact SSN
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
  
  // Redact IP addresses
  redacted = redacted.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_ADDRESS]');
  
  // Redact URLs with sensitive data
  redacted = redacted.replace(/https?:\/\/[^\s]+/g, (match) => {
    if (match.includes('password') || match.includes('token') || match.includes('key')) {
      return '[SENSITIVE_URL]';
    }
    return match;
  });
  
  return redacted;
}

/**
 * Redact sensitive information from object
 */
function redactObject(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  const redacted = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Check if key contains sensitive information
    const isSensitiveKey = SECURITY_CONFIG.SENSITIVE_PATTERNS.some(pattern => 
      pattern.test(key) || pattern.test(lowerKey)
    );
    
    if (isSensitiveKey) {
      redacted[key] = SECURITY_CONFIG.REDACTION_TEXT;
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else if (typeof value === 'string') {
      redacted[key] = redactString(value);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted;
}

/**
 * Secure console logging
 */
export function secureLog(level, message, data = null) {
  // Check if log level is allowed
  if (SECURITY_CONFIG.CURRENT_LOG_LEVEL < level) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  const levelName = Object.keys(SECURITY_CONFIG.LOG_LEVELS)[level];
  
  // Redact sensitive data
  const redactedData = data ? redactSensitiveData(data) : null;
  
  // Create log entry
  const logEntry = {
    timestamp,
    level: levelName,
    message: redactString(message),
    data: redactedData
  };
  
  // Log to console with appropriate level
  switch (level) {
    case SECURITY_CONFIG.LOG_LEVELS.ERROR:
      console.error(`[${timestamp}] ${levelName}:`, logEntry.message, redactedData);
      break;
    case SECURITY_CONFIG.LOG_LEVELS.WARN:
      console.warn(`[${timestamp}] ${levelName}:`, logEntry.message, redactedData);
      break;
    case SECURITY_CONFIG.LOG_LEVELS.INFO:
      console.info(`[${timestamp}] ${levelName}:`, logEntry.message, redactedData);
      break;
    case SECURITY_CONFIG.LOG_LEVELS.DEBUG:
      console.debug(`[${timestamp}] ${levelName}:`, logEntry.message, redactedData);
      break;
  }
  
  return logEntry;
}

/**
 * Secure error logging
 */
export function secureError(message, error, data = null) {
  const redactedData = data ? redactSensitiveData(data) : null;
  const redactedError = error ? {
    message: redactString(error.message),
    stack: redactString(error.stack),
    name: error.name
  } : null;
  
  return secureLog(SECURITY_CONFIG.LOG_LEVELS.ERROR, message, {
    error: redactedError,
    data: redactedData
  });
}

/**
 * Secure warning logging
 */
export function secureWarn(message, data = null) {
  return secureLog(SECURITY_CONFIG.LOG_LEVELS.WARN, message, data);
}

/**
 * Secure info logging
 */
export function secureInfo(message, data = null) {
  return secureLog(SECURITY_CONFIG.LOG_LEVELS.INFO, message, data);
}

/**
 * Secure debug logging
 */
export function secureDebug(message, data = null) {
  return secureLog(SECURITY_CONFIG.LOG_LEVELS.DEBUG, message, data);
}

/**
 * Secure API response logging
 */
export function secureApiLog(method, url, status, data = null) {
  const message = `${method} ${url} - ${status}`;
  const redactedData = data ? redactSensitiveData(data) : null;
  
  if (status >= 400) {
    return secureError(message, null, redactedData);
  } else if (status >= 300) {
    return secureWarn(message, redactedData);
  } else {
    return secureInfo(message, redactedData);
  }
}

/**
 * Secure database operation logging
 */
export function secureDbLog(operation, collection, data = null) {
  const message = `Database ${operation} on ${collection}`;
  const redactedData = data ? redactSensitiveData(data) : null;
  
  return secureInfo(message, redactedData);
}

/**
 * Secure authentication logging
 */
export function secureAuthLog(event, user, data = null) {
  const message = `Authentication ${event}`;
  const redactedData = data ? redactSensitiveData(data) : null;
  
  return secureInfo(message, {
    user: user ? redactSensitiveData(user) : null,
    data: redactedData
  });
}

/**
 * Secure security event logging
 */
export function secureSecurityLog(event, data = null) {
  const message = `Security event: ${event}`;
  const redactedData = data ? redactSensitiveData(data) : null;
  
  return secureWarn(message, redactedData);
}

/**
 * Disable console in production
 */
export function disableConsoleInProduction() {
  if (process.env.NODE_ENV === 'production') {
    // Override console methods to prevent sensitive data exposure
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    console.warn = () => {};
    console.error = () => {};
    
    // Override console methods with secure versions
    console.log = (message, data) => secureInfo(message, data);
    console.info = (message, data) => secureInfo(message, data);
    console.debug = (message, data) => secureDebug(message, data);
    console.warn = (message, data) => secureWarn(message, data);
    console.error = (message, data) => secureError(message, data);
  }
}

/**
 * Secure error handling
 */
export function secureErrorHandler(error, context = null) {
  const redactedError = {
    message: redactString(error.message),
    stack: redactString(error.stack),
    name: error.name
  };
  
  const redactedContext = context ? redactSensitiveData(context) : null;
  
  return secureError('Application error', redactedError, redactedContext);
}

/**
 * Secure request logging
 */
export function secureRequestLog(request, response = null) {
  const method = request.method || 'UNKNOWN';
  const url = request.url || 'UNKNOWN';
  const status = response ? response.status : 'UNKNOWN';
  
  const redactedRequest = {
    method,
    url: redactString(url),
    headers: redactSensitiveData(request.headers || {}),
    body: request.body ? redactSensitiveData(request.body) : null
  };
  
  const redactedResponse = response ? {
    status,
    headers: redactSensitiveData(response.headers || {})
  } : null;
  
  return secureInfo('Request processed', {
    request: redactedRequest,
    response: redactedResponse
  });
}

/**
 * Initialize secure logging
 */
export function initializeSecureLogging() {
  // Disable console in production
  disableConsoleInProduction();
  
  // Override global error handlers
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      secureError('Client error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      secureError('Unhandled promise rejection', event.reason);
    });
  }
  
  // Override Node.js error handlers
  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error) => {
      secureError('Uncaught exception', error);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      secureError('Unhandled promise rejection', reason);
    });
  }
}

export { SECURITY_CONFIG };
