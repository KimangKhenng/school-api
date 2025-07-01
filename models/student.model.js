export default (sequelize, DataTypes) =>
    sequelize.define('Student', {
        name: DataTypes.STRING,
        email: DataTypes.STRING
    });
