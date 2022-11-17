const express = require("express");

const app = express();

app.use((req, res, next) => {
  console.log("First middleware");
  next();
});

app.use((req, res, next) => {
  // next();
  res.send("Hello from response");
});

module.exports = app;
