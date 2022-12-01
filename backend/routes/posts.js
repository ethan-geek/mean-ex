const express = require("express");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const Post = require("../models/post");

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
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId,
    });
    post
      .save()
      .then((createdPost) => {
        res.status(201).json({
          message: "Post added sucessfully!",
          post: {
            ...createdPost,
            id: createdPost._id,
          },
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Creating a post failed!",
        });
      });
  }
);

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (!!req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }

    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath,
      creator: req.userData.userId,
    });
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
      .then((result) => {
        if (result.modifiedCount > 0) {
          res.status(200).json({ message: "update successful!" });
        } else {
          res.status(401).json({ message: "Not authorized" });
        }
      })
      .catch((err) => {
        res.status(500).json({
          message: "Couldn't update post!",
        });
      });
  }
);

router.get("", (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchPosts;

  if (!!pageSize && !!currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .find()
    .then((docs) => {
      fetchPosts = docs;
      return Post.count();
    })
    .then((count) => {
      res.status(200).json({
        message: "Posts fetched succesfully!",
        posts: fetchPosts,
        maxPosts: count,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Fetching posts failed!",
      });
    });
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (!!post) {
        res.status(200).json({
          message: "Posts fetched succesfully!",
          post,
        });
      } else {
        res.status(200).json({
          message: "Not Found",
          post: null,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Fetching a post failed!",
      });
    });
});

router.delete("/:id", checkAuth, (req, res, next) => {
  console.log(req.params.id);
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Deletion successful!" });
      } else {
        res.status(401).json({ message: "Not authorized" });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Deleting a post failed!",
      });
    });
});

module.exports = router;
