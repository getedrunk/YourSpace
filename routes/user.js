const express = require("express");
const router = express.Router();

//error
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

//model
const User = require("../models/user.js");
const passport = require("passport");

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newuser = new User({ username, email });
      const reg = await User.register(newuser, password);
      console.log(reg);
      req.flash("success", "Welcome to Yourspace");
      res.redirect("/listings");
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("signup");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success","Welcome you are now loggeg in");
    res.redirect("/listings");
  }
);

module.exports = router;
