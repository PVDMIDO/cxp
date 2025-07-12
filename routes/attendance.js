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

module.exports = router;
