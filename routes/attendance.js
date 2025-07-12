const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// GET /attendance-log
// Admin: get all logs, Employee: get own logs
router.get('/attendance-log', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    let logs;

    if (user.role === 'admin') {
      logs = await Attendance.findAll({
        include: ['Employee'],
        order: [['timestamp', 'DESC']],
      });
    } else {
      logs = await Attendance.findAll({
        where: { employeeId: user.id },
        order: [['timestamp', 'DESC']],
      });
    }

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/attend-in', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { employeeId } = req.body;

    if (user.role !== 'employee' || user.id !== employeeId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const attendance = await Attendance.create({
      employeeId,
      check_in: new Date(),
      check_out: null,
    });

    res.status(201).json({ message: 'Check-in recorded', attendance });
  } catch (error) {
    console.error('Error recording check-in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/attend-out', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { employeeId } = req.body;

    if (user.role !== 'employee' || user.id !== employeeId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Find the latest attendance record for today without check_out
    const attendance = await Attendance.findOne({
      where: {
        employeeId,
        check_out: null,
      },
      order: [['check_in', 'DESC']],
    });

    if (!attendance) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }

    attendance.check_out = new Date();
    await attendance.save();

    res.json({ message: 'Check-out recorded', attendance });
  } catch (error) {
    console.error('Error recording check-out:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
