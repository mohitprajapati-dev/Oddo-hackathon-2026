import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import * as userController from "./user.controller.js";

const router = express.Router();

router.use(protect);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);

export default router;
