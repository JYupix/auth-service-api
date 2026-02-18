import { Router } from "express";
import * as controller from "./comments.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

// router.post("/me", authenticateToken, controller.getMyComments);
// router.patch("/:id", authenticateToken, controller.updateComment);
// router.delete("/:id", authenticateToken, controller.deleteComment);

export default router;