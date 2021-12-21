const { Sequelize } = require('sequelize');

let { DB_DIALECT, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

// sequelize instance
const DB = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: DB_DIALECT,
    port: DB_PORT,
    // operatorsAliases: false,
    logging: false,
});

module.exports = DB;
