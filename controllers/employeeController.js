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
    const { name, employee_id, department, position, photo_url, face_descriptor } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO employees (name, employee_id, department, position, photo_url, face_descriptor) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, employee_id, department, position, photo_url, face_descriptor]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Add employee error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateEmployee = async (req, res) => {
    const id = req.params.id;
    const { name, employee_id, department, position, photo_url, face_descriptor } = req.body;
    try {
        const result = await pool.query(
            'UPDATE employees SET name=$1, employee_id=$2, department=$3, position=$4, photo_url=$5, face_descriptor=$6 WHERE id=$7 RETURNING *',
            [name, employee_id, department, position, photo_url, face_descriptor, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update employee error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteEmployee = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query('DELETE FROM employees WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        console.error('Delete employee error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getEmployees, addEmployee, updateEmployee, deleteEmployee };
