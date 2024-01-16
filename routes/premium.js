const express = require("express");

const premiumController = require("../controllers/premium");

const authenticationMiddleware = require("../middleware/auth");

const router = express.Router();

router.get(
  "/leaderBoard",
  authenticationMiddleware.authentication,
  premiumController.getLeaderBoard
);

module.exports = router;
