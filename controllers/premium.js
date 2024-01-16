const User = require("../models/user");
const Expense = require("../models/expense");
const sequelize = require("sequelize");

exports.getLeaderBoard = async (req, res, next) => {
  try {
    const leaderBoard = await User.findAll({
      attributes: ["id", "name", "totalExpense"],
      group: ["users.id"],
      order: [["totalExpense"]],
    });
    res.status(200).json(leaderBoard);
  } catch (err) {
    console.log(err);
  }
};
