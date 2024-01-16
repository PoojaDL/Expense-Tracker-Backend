const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtKey = process.env.JWT_SECRET_KEY;

exports.authentication = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    console.log("token", token);
    const user = jwt.verify(token, jwtKey);
    User.findByPk(user.userId)
      .then((user) => {
        req.user = user.dataValues;
        next();
      })
      .catch((err) => console.log(err));
  } catch (err) {
    console.log(err);
    return res.status(401).json({ success: false });
  }
};
