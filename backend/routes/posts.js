const express = require("express");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");
const PostController = require("../controllers/post");

const router = express.Router();

const MIME_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = MIME_TYPE[file.mimetype];
    let error = new Error("Invalid mime type!");
    if (!!isValid) {
      error = null;
    }
    // server.js 파일의 상대 경로로 정의 즉 server.js 파일이 저장된 경로에 상대적으로 지정
    callback(error, "backend/images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE[file.mimetype];
    callback(null, name + "-" + Date.now() + "." + ext);
  },
});

router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  PostController.createPost
);

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  PostController.updatePost
);

router.get("", PostController.getPosts);

router.get("/:id", PostController.getPostById);

router.delete("/:id", checkAuth, PostController.deletePostById);

module.exports = router;
