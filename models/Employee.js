module.exports = (sequelize, DataTypes) => {
    const Employee = sequelize.define('Employee', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        employeeId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        photoUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    return Employee;
};
