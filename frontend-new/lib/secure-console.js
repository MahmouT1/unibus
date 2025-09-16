/**
 * Secure console implementation for client-side
 * Prevents sensitive information from appearing in browser console
 */

// Sensitive data patterns to redact
const SENSITIVE_PATTERNS = [
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
];

const REDACTION_TEXT = '[REDACTED]';

/**
 * Redact sensitive information from data
 */
function redactSensitiveData(data) {
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
    const isSensitiveKey = SENSITIVE_PATTERNS.some(pattern => 
      pattern.test(key) || pattern.test(lowerKey)
    );
    
    if (isSensitiveKey) {
      redacted[key] = REDACTION_TEXT;
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
function secureLog(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const redactedData = data ? redactSensitiveData(data) : null;
  
  // Log to console with appropriate level
  switch (level) {
    case 'error':
      console.error(`[${timestamp}] ${level.toUpperCase()}:`, redactString(message), redactedData);
      break;
    case 'warn':
      console.warn(`[${timestamp}] ${level.toUpperCase()}:`, redactString(message), redactedData);
      break;
    case 'info':
      console.info(`[${timestamp}] ${level.toUpperCase()}:`, redactString(message), redactedData);
      break;
    case 'debug':
      console.debug(`[${timestamp}] ${level.toUpperCase()}:`, redactString(message), redactedData);
      break;
    default:
      console.log(`[${timestamp}] ${level.toUpperCase()}:`, redactString(message), redactedData);
  }
}

/**
 * Override console methods with secure versions
 */
function overrideConsole() {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
    trace: console.trace,
    group: console.group,
    groupCollapsed: console.groupCollapsed,
    groupEnd: console.groupEnd,
    table: console.table,
    dir: console.dir,
    dirxml: console.dirxml,
    assert: console.assert,
    count: console.count,
    countReset: console.countReset,
    time: console.time,
    timeEnd: console.timeEnd,
    timeLog: console.timeLog,
    clear: console.clear
  };
  
  // Override console.log
  console.log = (...args) => {
    const redactedArgs = args.map(arg => redactSensitiveData(arg));
    originalConsole.log(...redactedArgs);
  };
  
  // Override console.info
  console.info = (...args) => {
    const redactedArgs = args.map(arg => redactSensitiveData(arg));
    originalConsole.info(...redactedArgs);
  };
  
  // Override console.warn
  console.warn = (...args) => {
    const redactedArgs = args.map(arg => redactSensitiveData(arg));
    originalConsole.warn(...redactedArgs);
  };
  
  // Override console.error
  console.error = (...args) => {
    const redactedArgs = args.map(arg => redactSensitiveData(arg));
    originalConsole.error(...redactedArgs);
  };
  
  // Override console.debug
  console.debug = (...args) => {
    const redactedArgs = args.map(arg => redactSensitiveData(arg));
    originalConsole.debug(...redactedArgs);
  };
  
  // Override console.trace
  console.trace = (...args) => {
    const redactedArgs = args.map(arg => redactSensitiveData(arg));
    originalConsole.trace(...redactedArgs);
  };
  
  // Override console.table
  console.table = (data) => {
    const redactedData = redactSensitiveData(data);
    originalConsole.table(redactedData);
  };
  
  // Override console.dir
  console.dir = (obj) => {
    const redactedObj = redactSensitiveData(obj);
    originalConsole.dir(redactedObj);
  };
  
  // Override console.dirxml
  console.dirxml = (obj) => {
    const redactedObj = redactSensitiveData(obj);
    originalConsole.dirxml(redactedObj);
  };
  
  // Override console.assert
  console.assert = (condition, ...args) => {
    const redactedArgs = args.map(arg => redactSensitiveData(arg));
    originalConsole.assert(condition, ...redactedArgs);
  };
  
  // Override console.time
  console.time = (label) => {
    const redactedLabel = redactString(label);
    originalConsole.time(redactedLabel);
  };
  
  // Override console.timeEnd
  console.timeEnd = (label) => {
    const redactedLabel = redactString(label);
    originalConsole.timeEnd(redactedLabel);
  };
  
  // Override console.timeLog
  console.timeLog = (label, ...args) => {
    const redactedLabel = redactString(label);
    const redactedArgs = args.map(arg => redactSensitiveData(arg));
    originalConsole.timeLog(redactedLabel, ...redactedArgs);
  };
  
  // Override console.count
  console.count = (label) => {
    const redactedLabel = redactString(label);
    originalConsole.count(redactedLabel);
  };
  
  // Override console.countReset
  console.countReset = (label) => {
    const redactedLabel = redactString(label);
    originalConsole.countReset(redactedLabel);
  };
  
  // Override console.group
  console.group = (label) => {
    const redactedLabel = redactString(label);
    originalConsole.group(redactedLabel);
  };
  
  // Override console.groupCollapsed
  console.groupCollapsed = (label) => {
    const redactedLabel = redactString(label);
    originalConsole.groupCollapsed(redactedLabel);
  };
  
  // Override console.groupEnd
  console.groupEnd = () => {
    originalConsole.groupEnd();
  };
  
  // Override console.clear
  console.clear = () => {
    originalConsole.clear();
  };
}

/**
 * Initialize secure console
 */
export function initializeSecureConsole() {
  // Override console methods
  overrideConsole();
  
  // Override global error handlers
  window.addEventListener('error', (event) => {
    secureLog('error', 'Client error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });
  
  // Override unhandled promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    secureLog('error', 'Unhandled promise rejection', {
      reason: event.reason,
      promise: event.promise
    });
  });
  
  // Override fetch to log API calls securely
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, options] = args;
    const redactedUrl = redactString(url);
    const redactedOptions = options ? redactSensitiveData(options) : null;
    
    secureLog('info', 'API call', {
      url: redactedUrl,
      options: redactedOptions
    });
    
    try {
      const response = await originalFetch(...args);
      secureLog('info', 'API response', {
        url: redactedUrl,
        status: response.status,
        statusText: response.statusText
      });
      return response;
    } catch (error) {
      secureLog('error', 'API error', {
        url: redactedUrl,
        error: error.message
      });
      throw error;
    }
  };
  
  // Override XMLHttpRequest to log API calls securely
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    xhr.open = function(method, url, ...args) {
      const redactedUrl = redactString(url);
      secureLog('info', 'XHR request', {
        method,
        url: redactedUrl
      });
      return originalOpen.call(this, method, url, ...args);
    };
    
    xhr.send = function(data) {
      const redactedData = data ? redactSensitiveData(data) : null;
      secureLog('info', 'XHR send', {
        data: redactedData
      });
      return originalSend.call(this, data);
    };
    
    return xhr;
  };
  
  // Override localStorage to log access securely
  const originalLocalStorage = window.localStorage;
  const originalSetItem = originalLocalStorage.setItem;
  const originalGetItem = originalLocalStorage.getItem;
  const originalRemoveItem = originalLocalStorage.removeItem;
  
  originalLocalStorage.setItem = function(key, value) {
    const redactedKey = redactString(key);
    const redactedValue = redactString(value);
    secureLog('info', 'LocalStorage set', {
      key: redactedKey,
      value: redactedValue
    });
    return originalSetItem.call(this, key, value);
  };
  
  originalLocalStorage.getItem = function(key) {
    const redactedKey = redactString(key);
    secureLog('info', 'LocalStorage get', {
      key: redactedKey
    });
    return originalGetItem.call(this, key);
  };
  
  originalLocalStorage.removeItem = function(key) {
    const redactedKey = redactString(key);
    secureLog('info', 'LocalStorage remove', {
      key: redactedKey
    });
    return originalRemoveItem.call(this, key);
  };
  
  // Override sessionStorage to log access securely
  const originalSessionStorage = window.sessionStorage;
  const originalSessionSetItem = originalSessionStorage.setItem;
  const originalSessionGetItem = originalSessionStorage.getItem;
  const originalSessionRemoveItem = originalSessionStorage.removeItem;
  
  originalSessionStorage.setItem = function(key, value) {
    const redactedKey = redactString(key);
    const redactedValue = redactString(value);
    secureLog('info', 'SessionStorage set', {
      key: redactedKey,
      value: redactedValue
    });
    return originalSessionSetItem.call(this, key, value);
  };
  
  originalSessionStorage.getItem = function(key) {
    const redactedKey = redactString(key);
    secureLog('info', 'SessionStorage get', {
      key: redactedKey
    });
    return originalSessionGetItem.call(this, key);
  };
  
  originalSessionStorage.removeItem = function(key) {
    const redactedKey = redactString(key);
    secureLog('info', 'SessionStorage remove', {
      key: redactedKey
    });
    return originalSessionRemoveItem.call(this, key);
  };
  
  // Override document.cookie to log access securely
  const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
  Object.defineProperty(document, 'cookie', {
    get: function() {
      secureLog('info', 'Cookie access');
      return originalCookieDescriptor.get.call(this);
    },
    set: function(value) {
      const redactedValue = redactString(value);
      secureLog('info', 'Cookie set', {
        value: redactedValue
      });
      return originalCookieDescriptor.set.call(this, value);
    }
  });
  
  secureLog('info', 'Secure console initialized');
}

/**
 * Export secure logging functions
 */
export { secureLog, redactSensitiveData };
