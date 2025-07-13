const pool = require('../db');

const getEmployees = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM employees');
        res.json(result.rows);
    } catch (err) {
        console.error('Get employees error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const addEmployee = async (req, res) => {
    const { name, employee_id, department, position, photo_url } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO employees (name, employee_id, department, position, photo_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, employee_id, department, position, photo_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Add employee error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getEmployees, addEmployee };
