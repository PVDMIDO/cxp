
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Employee = require('../models/Employee');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware to verify JWT and admin role (simplified example)
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
    const employees = await Employee.findAll({
      attributes: ['id', 'name', 'employee_id', 'photo_url'],
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/register-face - register new employee (admin only)
router.post('/register-face', authenticateAdmin, async (req, res) => {
  const { name, employee_id, photo_url } = req.body;
  if (!name || !employee_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingEmployee = await Employee.findOne({ where: { employee_id } });
    if (existingEmployee) {
      return res.status(409).json({ message: 'Employee ID already exists' });
    }
    await Employee.create({ name, employee_id, photo_url });
    res.status(201).json({ message: 'Employee registered successfully' });
  } catch (error) {
    console.error('Error registering employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin-login - admin login
router.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
