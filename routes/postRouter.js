const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

router.post("/", postController.create_post);

router.get("/", postController.get_all_posts);

router.get("/:id", postController.get_single_post);

router.delete("/:id", postController.delete_post);

module.exports = router;
