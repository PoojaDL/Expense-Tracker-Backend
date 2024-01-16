const express = require("express");

const authController = require("../controllers/auth");
const router = express.Router();

router.post("/", authController.postLoginUser);

router.post("/signUp", authController.postSignUser);

router.post("/forgotpassword", authController.forgotPassword);

router.post("/resetpassword/:id/:token", authController.resetPassword);

module.exports = router;
