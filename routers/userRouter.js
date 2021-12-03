const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const { generateRandomString, getUserByEmail } = require('../helpers');

const userRouter = (users) => {
  
  router.get("/register", (req, res) => {
    if (req.session.userID) return res.redirect("/urls");
    res.render("register", { user: null });
  });

  router.post("/register", (req, res) => {
    const { email, password } = req.body;
    const user = getUserByEmail(email, users);
    if (!email || !password) {
      const templateVars = {
        user,
        code: 400,
        message: "Email or password are empty. Please try again.",
      };
      return res.status(400).render("error", templateVars);
    }
    if (user) {
      const templateVars = {
        user,
        code: 400,
        message: "This account already exists. Please login.",
      };
      return res.status(400).render("error", templateVars);
    }
    const userID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[userID] = {
      id: userID,
      email,
      password: hashedPassword,
      visitorIDs: {},
    };
    req.session.userID = userID;
    req.session.visitorIDs = users[userID].visitorIDs;
    res.redirect("/urls");
  });

  router.get("/login", (req, res) => {
    if (req.session.userID) return res.redirect("/urls");
    res.render("login", { user: null });
  });

  router.post("/login", (req, res) => {
    const { email, password } = req.body;
    const user = getUserByEmail(email, users);
    if (user && password && bcrypt.compareSync(password, user.password)) {
      req.session.userID = user.id;
      req.session.visitorIDs = user.visitorIDs;
      return res.redirect("/urls");
    }
    const templateVars = {
      user,
      code: 403,
      message: "Email or password are incorrect. Please try again, or register if you don't have an account.",
    };
    res.status(403).render("error", templateVars);
  });
  
  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/users/login");
  });

  return router;
};

module.exports = userRouter;