const pool = require('../db');

const markAttendance = async (req, res) => {
    const { employee_id, attendance_type, happy_score, angry_score } = req.body;
    if (!employee_id) {
        return res.status(400).json({ message: 'Employee ID is required' });
    }
    if (!attendance_type || !['in', 'out'].includes(attendance_type)) {
        return res.status(400).json({ message: 'Attendance type must be "in" or "out"' });
    }
    try {
        const timestamp = new Date();
        const result = await pool.query(
            'INSERT INTO attendance (employee_id, timestamp, attendance_type, happy_score, angry_score) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [employee_id, timestamp, attendance_type, happy_score, angry_score]
        );
        res.status(201).json({ message: 'Attendance marked', attendance: result.rows[0] });
    } catch (err) {
        console.error('Mark attendance error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { markAttendance };
