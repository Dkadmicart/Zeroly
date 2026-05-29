// server/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

// General API Limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Strict Upload Limiter
export const strictUploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 uploads/signatures per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Upload limit reached. Please try again in an hour.' }
});

// Strict Auth Limiter
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login/register attempts per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' }
});
