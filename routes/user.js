const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
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
      'SELECT id, name, employee_id, photo_url FROM employees',
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
  const { id, employee_id, name, photo_url } = req.body;
  if (!id || !employee_id || !name || !photo_url) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Insert new employee into employees table
    await sequelize.query(
      'INSERT INTO employees (id, employee_id, name, photo_url) VALUES (:id, :employee_id, :name, :photo_url)',
      {
        replacements: { id, employee_id, name, photo_url },
        type: QueryTypes.INSERT,
      }
    );
    res.status(201).json({ message: 'Employee registered successfully' });
  } catch (error) {
    console.error('Error registering employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
