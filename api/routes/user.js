const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { token } = require("morgan");

/*
Route           /signup
Description     create user
Access          PUBLIC
Parameter       NONE
Methods         POST
*/
router.post("/signup", async (req, res, next) => {
  const { email, password: plainTextPassword } = req.body;
  if (plainTextPassword.length < 5) {
    return res.json("Please! create a secure password");
  }
  const password = await bcrypt.hash(plainTextPassword, 10);

  try {
    const user = await User.create({
      email,
      password,
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

/*
Route           /login
Description     login user
Access          PUBLIC
Parameter       NONE
Methods         POST
*/
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).lean();
  if (!email) {
    return res.status(500).json("invalid username and paasword");
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "1h",
      }
    );
  }
  return res.status(200).json({
    message: "Auth successful",
    token: token,
  });
});

/*
Route           /logout
Description     logout user
Access          PUBLIC
Parameter       NONE
Methods         POST
*/
router.post("/logout", async (req, res, next) => {
  const useLogout = res.clearCookie("token");
  res.json({
    message: "Logout user sucessfully",
  });
});

/*
Route           /
Description     delete user
Access          PUBLIC
Parameter       :userId
Methods         DELETE
*/
router.delete("/:userId", async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.userId });
    res.status(200).json({
      message: "User deleted sucessfully",
      user: user,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});
module.exports = router;
