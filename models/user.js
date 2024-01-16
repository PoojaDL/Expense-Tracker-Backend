const Sequilize = require("sequelize");

const sequelize = require("../util/database");

const User = sequelize.define("users", {
  id: {
    type: Sequilize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequilize.STRING,
  },
  password: {
    type: Sequilize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequilize.TEXT,
    allowNull: false,
  },
  isPremiumuser: { type: Sequilize.BOOLEAN, defaulValue: false },
  totalExpense: {
    type: Sequilize.INTEGER,
    defaulValue: 0,
  },
  totalIncome: {
    type: Sequilize.INTEGER,
    defaulValue: 0,
  },
});

module.exports = User;
