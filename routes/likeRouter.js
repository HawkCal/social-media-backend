const express = require("express");
const router = express.Router();
const likeController = require("../controllers/likeController");

router.post("/", likeController.create_like);

router.post("/remove", likeController.remove_like);

module.exports = router;
