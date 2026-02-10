const rateLimit = require('express-rate-limit');
const config = require('../config/app.config');

const rateLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests
    skipSuccessfulRequests: false,
    // Skip failed requests
    skipFailedRequests: false
});

// Stricter rate limiting for authentication endpoints
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        success: false,
        error: 'Too many login attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    rateLimiter,
    authRateLimiter
};
