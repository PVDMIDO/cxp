const express = require('express');
const router = express.Router();
const { markAttendance, markAttendanceByFaceDescriptor } = require('../controllers/attendanceController');

router.post('/', markAttendance);
router.post('/face', markAttendanceByFaceDescriptor);

module.exports = router;
