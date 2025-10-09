const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post(
  "/register",
  authController.registerValidation,
  authController.register
);
router.get("/login", authController.loginValidation, authController.login);

module.exports = router;
