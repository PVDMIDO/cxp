const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// PostgreSQL pool setup - update connection details as needed
const pool = new Pool({
    user: 'cxpayman_user',
    host: 'dpg-d1o3mvffte5s73cobo00-a',
    database: 'cxpayman',
    password: 'na2F6M6MtqYRcO96eMymqPpGMXBiXHE4',
    port: 5432,
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        // For demo, return success without token
        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get employees endpoint
app.get('/api/employees', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM employees');
        res.json(result.rows);
    } catch (err) {
        console.error('Get employees error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add new employee endpoint
app.post('/api/employees', async (req, res) => {
    const { name, employee_id, photo_url } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO employees (name, employee_id, photo_url) VALUES ($1, $2, $3) RETURNING *',
            [name, employee_id, photo_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Add employee error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
