const Sequilize = require("sequelize");

const sequelize = require("../util/database");

const Order = sequelize.define("orders", {
  id: {
    type: Sequilize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  orderId: {
    type: Sequilize.STRING,
    allowNull: false,
  },
  paymentId: {
    type: Sequilize.STRING,
  },
  status: {
    type: Sequilize.STRING,
    allowNull: false,
  },
});

module.exports = Order;
