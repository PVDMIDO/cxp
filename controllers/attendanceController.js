const pool = require('../db');

const euclideanDistance = (desc1, desc2) => {
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
        sum += (desc1[i] - desc2[i]) ** 2;
    }
    return Math.sqrt(sum);
};

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

const markAttendanceByFaceDescriptor = async (req, res) => {
    const { face_descriptor, attendance_type, happy_score, angry_score } = req.body;
    if (!face_descriptor || !Array.isArray(face_descriptor)) {
        return res.status(400).json({ message: 'Face descriptor is required and must be an array' });
    }
    if (!attendance_type || !['in', 'out'].includes(attendance_type)) {
        return res.status(400).json({ message: 'Attendance type must be "in" or "out"' });
    }
    try {
        // Fetch all employees with face descriptors
        const result = await pool.query('SELECT * FROM employees WHERE face_descriptor IS NOT NULL');
        const employees = result.rows;

        // Find closest match by Euclidean distance
        let minDistance = Infinity;
        let matchedEmployee = null;
        for (const emp of employees) {
            if (!emp.face_descriptor) continue;
            const dist = euclideanDistance(face_descriptor, emp.face_descriptor);
            if (dist < minDistance) {
                minDistance = dist;
                matchedEmployee = emp;
            }
        }

        // Threshold for matching (tune as needed)
        const MATCH_THRESHOLD = 0.6;
        if (!matchedEmployee || minDistance > MATCH_THRESHOLD) {
            return res.status(404).json({ message: 'No matching face found' });
        }

        // Mark attendance for matched employee
        const timestamp = new Date();
        const attendanceResult = await pool.query(
            'INSERT INTO attendance (employee_id, timestamp, attendance_type, happy_score, angry_score) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [matchedEmployee.employee_id, timestamp, attendance_type, happy_score, angry_score]
        );

        res.status(201).json({
            message: 'Attendance marked',
            attendance: attendanceResult.rows[0],
            employee: matchedEmployee,
            distance: minDistance
        });
    } catch (err) {
        console.error('Mark attendance by face descriptor error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { markAttendance, markAttendanceByFaceDescriptor };
