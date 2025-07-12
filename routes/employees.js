const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const { Employee } = require('../models');

// Get all employees
router.get('/', authenticateToken, async (req, res) => {
    try {
        const employees = await Employee.findAll();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new employee
router.post('/', authenticateToken, async (req, res) => {
    const { name, employeeId, photoUrl } = req.body;
    try {
        const newEmployee = await Employee.create({ name, employeeId, photoUrl });
        res.status(201).json(newEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update employee
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        const { name, employeeId, photoUrl } = req.body;
        if (name) employee.name = name;
        if (employeeId) employee.employeeId = employeeId;
        if (photoUrl) employee.photoUrl = photoUrl;
        await employee.save();
        res.json(employee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete employee
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        await employee.destroy();
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
