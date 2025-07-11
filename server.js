require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize } = require('./config/database');

const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api', userRoutes);


// Test DB connection and sync models
sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    return sequelize.sync();
  })
  .then(() => console.log('Database synced'))
  .catch(err => console.log('Error: ' + err));

// Basic route
app.get('/', (req, res) => {
  res.send('Employee Facial Recognition Login Backend is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
