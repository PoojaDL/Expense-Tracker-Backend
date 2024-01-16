const express = require("express");

const homeController = require("../controllers/home");
const middlewareAuth = require("../middleware/auth");
const router = express.Router();

router.get("/", middlewareAuth.authentication, homeController.getAllExpenses);

router.get("/user", middlewareAuth.authentication, homeController.getUser);

router.get(
  "/download-expense",
  middlewareAuth.authentication,
  homeController.dowloadExpenses
);

router.get(
  "/:id",
  middlewareAuth.authentication,
  homeController.getFilteredExpenses
);

router.post("/", middlewareAuth.authentication, homeController.postExpenses);

router.delete(
  "/:id",
  middlewareAuth.authentication,
  homeController.deleteExpense
);

module.exports = router;
