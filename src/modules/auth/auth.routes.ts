import { Router } from "express";
import * as controller from "./auth.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", controller.register);
router.post("/verify-email", controller.verifyEmail);
router.post("/login", controller.login);
router.post("/forgot-password", controller.forgotPassword);
router.post("/logout", controller.logout);
router.post("/reset-password", controller.resetPassword);
router.post("/me", authenticateToken, controller.getCurrentUser);

export default router;
