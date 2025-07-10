const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// POST /register-face - Admin only: Add or update employee face data
router.post('/register-face', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { username, password, role, faceEmbedding } = req.body;
    if (!username || !password || !faceEmbedding) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let employee = await Employee.findOne({ where: { username } });
    const passwordHash = await bcrypt.hash(password, 10);

    if (employee) {
      // Update existing employee
      employee.passwordHash = passwordHash;
      employee.role = role || employee.role;
      employee.faceEmbedding = faceEmbedding;
      await employee.save();
    } else {
      // Create new employee
      employee = await Employee.create({
        username,
        passwordHash,
        role: role || 'employee',
        faceEmbedding,
      });
    }

    res.json({ message: 'Employee face data registered/updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /login-face - Employee login using face embedding
router.post('/login-face', async (req, res) => {
  try {
    const { faceEmbedding } = req.body;
    if (!faceEmbedding) {
      return res.status(400).json({ message: 'Face embedding is required' });
    }

    // TODO: Implement face embedding comparison logic here
    // For now, just find employee with exact faceEmbedding match (placeholder)
    const employee = await Employee.findOne({ where: { faceEmbedding } });

    if (!employee) {
      // Log failed attempt
      await Attendance.create({
        employeeId: null,
        status: 'failed',
        timestamp: new Date(),
      });
      return res.status(401).json({ message: 'Face not recognized' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: employee.id, username: employee.username, role: employee.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Log successful login
    await Attendance.create({
      employeeId: employee.id,
      status: 'success',
      timestamp: new Date(),
    });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
