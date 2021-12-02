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
    if (!req.body.email || !req.body.password) {
      const templateVars = {
        user: users[req.session.userID],
        code: 400,
        message: "Email or password are empty. Please try again.",
      };
      return res.status(400).render("error", templateVars);
    }
    const existingUser = getUserByEmail(req.body.email, users);
    if (existingUser) {
      const templateVars = {
        user: existingUser.id,
        code: 400,
        message: "This account already exists. Please login.",
      };
      return res.status(400).render("error", templateVars);
    }
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
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
    const existingUser = getUserByEmail(req.body.email, users);
    if (
      existingUser &&
      req.body.password &&
      bcrypt.compareSync(req.body.password, existingUser.password)
    ) {
      req.session.userID = existingUser.id;
      req.session.visitorIDs = existingUser.visitorIDs;
      res.redirect("/urls");
    } else {
      const templateVars = {
        user: users[req.session.userID],
        code: 403,
        message:
          "Email or password are incorrect. Please try again, or register if you don't have an account.",
      };
      res.status(403).render("error", templateVars);
    }
  });
  
  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/users/login");
  });

  return router;
};

module.exports = userRouter;