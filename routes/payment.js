const express = require("express");

const purchaseController = require("../controllers/purchase");

const authenticationMiddleware = require("../middleware/auth");

const router = express.Router();

router.get(
  "/premiumMembership",
  authenticationMiddleware.authentication,
  purchaseController.purchasePremium
);

router.post(
  "/updateTransaction",
  authenticationMiddleware.authentication,
  purchaseController.updateTransaction
);

module.exports = router;
