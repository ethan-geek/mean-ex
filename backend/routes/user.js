const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const user = require("../models/user");

const router = express.Router();

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "User created",
          result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Invalid authentication credentials!",
        });
      });
  });
});

router.post("/login", (req, res, next) => {
  // 1. check email
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      // 2. check password
      return bcrypt
        .compare(req.body.password, user.password)
        .then((result) => [result, user]);
    })
    .then((results) => {
      const result = results[0];
      const user = results[1];

      if (!result) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      console.log(user._id);
      //3. create token
      const token = jwt.sign(
        { email: user.email, userId: user._id },
        "secret_this_should_be_longer",
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token,
        expiresIn: 3600,
        userId: user._id,
      });
    })
    .catch((err) => {
      return res.status(401).json({
        message: "Invalid authentication credentials!",
      });
    });
});

module.exports = router;
