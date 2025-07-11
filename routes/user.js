const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// GET /user-profile - get logged-in user's profile
router.get('/user-profile', authenticateToken, async (req, res) => {
  try {
    const user = await Employee.findByPk(req.user.id, {
      attributes: ['id', 'username', 'role', 'createdAt', 'updatedAt'],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes for employee management

// POST /employees - add new employee
router.post('/employees', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }
    const existing = await Employee.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const employee = await Employee.create({ username, passwordHash, role: role || 'employee' });
    res.json({ message: 'Employee created', employeeId: employee.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /employees/:id - edit employee
router.put('/employees/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;
    const employee = await Employee.findByPk(id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (username) employee.username = username;
    if (password) employee.passwordHash = await bcrypt.hash(password, 10);
    if (role) employee.role = role;

    await employee.save();
    res.json({ message: 'Employee updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /employees/:id - delete employee
router.delete('/employees/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    await employee.destroy();
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
