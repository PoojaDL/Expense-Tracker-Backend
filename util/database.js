const Sequilize = require("sequelize");
require("dotenv").config();

const schemaName = process.env.SQL_SCHEMA_NAME;
const username = process.env.SQL_USER_NAME;
const password = process.env.SQL_PASSWORD;
const sqlDialect = process.env.SQL_DIALECT;
const sqlHost = process.env.SQL_HOST;

const sequelize = new Sequilize(schemaName, username, password, {
  dialect: sqlDialect,
  host: sqlHost,
});

module.exports = sequelize;
