const Sequilize = require("sequelize");

const sequelize = new Sequilize("expense-tracker", "root", "Pooja@123", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
