require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Use routes
app.use('/api', authRoutes);
app.use('/api/employees', employeeRoutes);
const attendanceRoutes = require('./routes/attendance');
app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => {
    res.send('Attendance Backend API is running.');
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
