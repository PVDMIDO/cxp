const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        dialect: 'postgres',
        logging: false,
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize);
db.Employee = require('./Employee')(sequelize, Sequelize);
db.Attendance = require('./Attendance')(sequelize, Sequelize);

// Define associations
db.Employee.hasMany(db.Attendance, { foreignKey: 'employeeId' });
db.Attendance.belongsTo(db.Employee, { foreignKey: 'employeeId' });

module.exports = db;
