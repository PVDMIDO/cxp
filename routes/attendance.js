const express = require('express');
const router = express.Router();
const { markAttendance, markAttendanceByFaceDescriptor, getAttendance } = require('../controllers/attendanceController');

router.post('/', markAttendance);
router.post('/face', markAttendanceByFaceDescriptor);
router.get('/', getAttendance);

module.exports = router;
