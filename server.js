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

app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
