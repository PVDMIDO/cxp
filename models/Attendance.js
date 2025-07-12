module.exports = (sequelize, DataTypes) => {
    const Attendance = sequelize.define('Attendance', {
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        checkIn: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        checkOut: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    });

    return Attendance;
};
