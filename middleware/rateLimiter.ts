import rateLimit from "express-rate-limit";

// Global Limiter - General browsing, static assets, etc.
// 500 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});

// Strict Limiter - Login, Registration, Contact Forms
// 10 requests per 15 minutes per IP to prevent brute force / spam
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many attempts from this IP, please wait 15 minutes before trying again.",
  },
});
