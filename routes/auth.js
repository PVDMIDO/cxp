const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Admin login route
router.post('/login-admin', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch user by username
    const users = await sequelize.query(
      'SELECT * FROM users WHERE username = $username AND role = \'admin\'',
      {
        bind: { username },
        type: QueryTypes.SELECT,
      }
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
