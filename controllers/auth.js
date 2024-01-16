const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
require("dotenv").config();

const jwtKey = process.env.JWT_SECRET_KEY;
const nodeAuthEMail = process.env.NODEMAILER_AUTH_USER;
const nodeAuthPass = process.env.NODEMAILER_AUTH_PASS;

const generateToken = (id, name) => {
  return jwt.sign({ userId: id, name: name }, jwtKey);
};

exports.postSignUser = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confPassword = req.body.confPassword;

  if (password !== confPassword) {
    return res
      .status(404)
      .json({ success: false, message: "Password entered are wrong" });
  }
  let saltRounds = 10;
  User.findAll({ where: { email: email } })
    .then((user) => {
      if (user.length !== 0) {
        return res
          .status(404)
          .json({ success: false, message: "User already exist" });
      } else {
        bcrypt.hash(password, saltRounds, (err, hash) => {
          User.create({
            name: name,
            email: email,
            password: hash,
          })
            .then((result) => {
              return res.status(200).json({
                success: true,
                message: "User Signed-In successfully",
              });
            })
            .catch((err) => console.log(err));
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.postLoginUser = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findAll({ where: { email: email } }).then((user) => {
    if (user.length !== 0) {
      bcrypt.compare(password, user[0].password, (err, result) => {
        if (result === true) {
          return res.status(200).json({
            success: true,
            message: "User Login successfully",
            token: generateToken(user[0].id, user[0].name),
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Enter the right Password",
          });
        }
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist",
      });
    }
  });
};

exports.forgotPassword = (req, res, next) => {
  const email = req.body.email;
  User.findAll({ where: { email: email } }).then((user) => {
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist",
      });
    }

    const token = jwt.sign({ id: user[0].id }, jwtKey, {
      expiresIn: "1d",
    });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: nodeAuthEMail,
        pass: nodeAuthPass,
      },
    });

    var mailOptions = {
      from: email,
      to: nodeAuthEMail,
      subject: `${email} your reset password have been initiated`,
      text: `http://localhost:3000/resetpassword/${user[0].id}/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        return res.status(200).json({
          success: true,
          message: "Successfully sent to your mail",
        });
      }
    });
  });
};

exports.resetPassword = (req, res) => {
  console.log(req.params);
  const { id, token } = req.params;
  const { password } = req.body;

  // console.log(id, password, token);
  jwt.verify(token, jwtKey, (err, decoded) => {
    if (err) {
      return res.status(404).json({
        success: false,
        message: "Error with token",
      });
    } else {
      bcrypt
        .hash(password, 10)
        .then((hash) => {
          User.findByPk(id)
            .then((user) => {
              user.password = hash;
              return user.save();
            })
            .then(() => {
              return res.status(200).json({
                success: true,
                message: "Successfully changed your password",
              });
            })
            .catch((err) => {
              return res.status(404).json({
                success: false,
                message: err,
              });
            });
        })
        .catch((err) => {
          return res.status(404).json({
            success: false,
            message: err,
          });
        });
    }
  });
};
