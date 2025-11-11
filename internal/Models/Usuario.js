import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize('sqlite::memory:')
const User = sequelize.define('usuario', {
    id: DataTypes.BIGINT,
    username: DataTypes.STRING,
    name: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    identification: DataTypes.BIGINT,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    role: DataTypes.STRING,
})