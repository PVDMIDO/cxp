const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// Middleware to verify JWT and admin role (simplified example)
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// GET /api/employees - list all employees (admin only)
router.get('/employees', authenticateAdmin, async (req, res) => {
  try {
    const employees = await sequelize.query(
      'SELECT id, username, role, face_embedding AS faceEmbedding FROM users',
      { type: QueryTypes.SELECT }
    );
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/register-face - register new employee (admin only)
router.post('/register-face', authenticateAdmin, async (req, res) => {
  console.log('Received register-face request body:', req.body);
  const { employee_id, name, department, faceEmbedding } = req.body;
  console.log('Fields:', { employee_id, name, department, faceEmbedding });
  if (!employee_id || !name || !department || !faceEmbedding) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Insert new employee into users table without id (auto-generated)
    await sequelize.query(
      'INSERT INTO users (employee_id, name, department, face_embedding, role) VALUES (:employee_id, :name, :department, :faceEmbedding, \'employee\')',
      {
        replacements: { employee_id, name, department, faceEmbedding },
        type: QueryTypes.INSERT,
      }
    );
    res.status(201).json({ message: 'Employee registered successfully' });
  } catch (error) {
    console.error('Error registering employee:', error);
    console.error(error.stack);
    if (error.name === 'SequelizeUniqueConstraintError' || (error.original && error.original.code === '23505')) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
