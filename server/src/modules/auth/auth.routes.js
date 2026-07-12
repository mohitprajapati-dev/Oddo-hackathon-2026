import { Router } from "express";
import * as authController from "./auth.controller.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/me", protect, authController.getMe);
router.post("/refresh", authController.refresh);

export default router;
