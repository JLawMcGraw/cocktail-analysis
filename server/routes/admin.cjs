// Temporary admin routes for password reset
// ⚠️ REMOVE AFTER USE - SECURITY RISK IN PRODUCTION
const express = require('express');
const bcrypt = require('bcrypt');
const { dbRun } = require('../database/db.cjs');

const router = express.Router();
const SALT_ROUNDS = 10;

// Temporary password reset endpoint
// ⚠️ DISABLE THIS IN PRODUCTION - NO AUTH!
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword, adminSecret } = req.body;

    // Basic protection - require secret key
    const expectedSecret = process.env.ADMIN_SECRET || 'TEMP_ADMIN_SECRET_12345';

    if (adminSecret !== expectedSecret) {
      return res.status(403).json({ error: 'Invalid admin secret' });
    }

    // Validate password meets requirements
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain uppercase letter' });
    }

    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain lowercase letter' });
    }

    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain number' });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update the password
    const result = await dbRun(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [passwordHash, email]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Password updated successfully',
      email: email
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
