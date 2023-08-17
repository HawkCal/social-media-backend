const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/", userController.create_user);

router.get("/auth-status", userController.check_auth_status);

router.get("/:id", userController.get_user);

router.get("/:id/posts", userController.get_user_posts);

router.get("/:id/likes", userController.get_user_likes);

router.delete("/:id", userController.delete_user);

router.delete("/:id", userController.delete_user);

router.post("/sign-in", userController.sign_in_user);

router.post("/sign-out", userController.sign_out_user);

module.exports = router;
