import express from "express";
import authRoutes from "./user/auth/auth.route";
import userRoutes from "./user/user/user.route";

const router = express.Router();
router.use("/friend", friendRoute);
module.exports = router;
