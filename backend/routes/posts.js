const express = require("express");

const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");

const PostController = require("../controllers/post");

const router = express.Router();

router.post("", checkAuth, extractFile, PostController.createPost);

router.put("/:id", checkAuth, extractFile, PostController.updatePost);

router.get("", PostController.getPosts);

router.get("/:id", PostController.getPostById);

router.delete("/:id", checkAuth, PostController.deletePostById);

module.exports = router;
