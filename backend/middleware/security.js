const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message: 'Too many requests, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};

// Different rate limits for different endpoints
const authLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
const uploadLimiter = createRateLimiter(60 * 60 * 1000, 10); // 10 uploads per hour

// Security headers
const securityMiddleware = helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
});

module.exports = {
    securityMiddleware,
    authLimiter,
    generalLimiter,
    uploadLimiter
};