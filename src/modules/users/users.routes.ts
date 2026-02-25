import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import * as usersController from "./users.controller.js";
import { isAdmin } from "../../middlewares/isAdmin.middleware.js";
import { upload } from "../../config/multer.js";

const router = Router();

router.get("/", usersController.searchUsers);
router.get("/me", authenticateToken, usersController.getMyProfile);
router.patch("/me", authenticateToken, usersController.updateMyProfile);
router.patch("/me/upload-photo", authenticateToken, upload.single("file"), usersController.uploadProfilePhoto);

router.get("/:username", usersController.getUserProfile);
router.post("/:username/follow", authenticateToken, usersController.toggleFollowUser);
router.get("/:username/followers", authenticateToken, usersController.getFollowers);
router.get("/:username/following", authenticateToken, usersController.getFollowing);

router.patch("/:username", authenticateToken, isAdmin, usersController.updateUserByAdmin);
router.delete("/:username", authenticateToken, isAdmin, usersController.deleteUserByAdmin);

export default router;
