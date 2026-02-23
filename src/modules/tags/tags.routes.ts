import { Router } from "express";
import * as controller from "./tags.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/isAdmin.middleware.js";

const router = Router();

router.get("/", controller.getTags);
router.get("/:slug/posts", controller.getPostsByTag);

router.post("/", authenticateToken, isAdmin, controller.createTag);
router.patch("/:slug", authenticateToken, isAdmin, controller.updateTag);
router.delete("/:slug", authenticateToken, isAdmin, controller.deleteTag);

export default router;