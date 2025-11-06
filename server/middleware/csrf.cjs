/**
 * CSRF Protection Middleware
 * Modern, simple CSRF protection using double-submit cookie pattern
 */

const crypto = require('crypto');

/**
 * Generate a random CSRF token
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF middleware - validates CSRF token from cookie and header
 * Safe methods (GET, HEAD, OPTIONS) are exempt
 */
function csrfProtection(req, res, next) {
  // Skip CSRF check for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Get CSRF token from cookie and header
  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.headers['x-csrf-token'];

  // Validate tokens exist and match
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or missing CSRF token',
    });
  }

  next();
}

/**
 * Endpoint to get a new CSRF token
 * Client should call this on page load and store the token
 */
function getCsrfToken(req, res) {
  const token = generateToken();

  // Set token in HTTP-only cookie
  res.cookie('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Return token to client (they'll send it in header)
  res.json({ csrfToken: token });
}

module.exports = {
  csrfProtection,
  getCsrfToken,
};
