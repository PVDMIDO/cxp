const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Test PostgreSQL connection
db.connect()
    .then(obj => {
        console.log('PostgreSQL connected');
        obj.done(); // release connection
    })
    .catch(error => {
        console.error('PostgreSQL connection error:', error);
    });

// Routes
app.get('/', (req, res) => {
    res.send('Face Detection Attendance Backend is running');
});

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
