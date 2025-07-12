const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const { Attendance } = require('../models');

// Get attendance records
router.get('/', authenticateToken, async (req, res) => {
    try {
        const records = await Attendance.findAll();
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get attendance by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const record = await Attendance.findByPk(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        res.json(record);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create attendance record
router.post('/', authenticateToken, async (req, res) => {
    const { employeeId, checkIn, checkOut } = req.body;
    try {
        const newRecord = await Attendance.create({ employeeId, checkIn, checkOut });
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update attendance record
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const record = await Attendance.findByPk(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        const { employeeId, checkIn, checkOut } = req.body;
        if (employeeId) record.employeeId = employeeId;
        if (checkIn) record.checkIn = checkIn;
        if (checkOut) record.checkOut = checkOut;
        await record.save();
        res.json(record);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete attendance record
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const record = await Attendance.findByPk(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        await record.destroy();
        res.json({ message: 'Record deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
