const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const { generateRandomString, getUserByEmail } = require('../helpers');

const userRouter = (templateVars, users) => {
  
  router.get("/register", (req, res) => {
    if (templateVars.user) return res.redirect("/urls");
    res.render("register", templateVars);
  });

  router.post("/register", (req, res) => {
    const { email, password } = req.body;
    const user = getUserByEmail(email, users);
    
    const errors = [];
    if (user) errors.push({ msg: "This account already exists." });
    if (!email || !password) errors.push({ msg: "Email or password are empty." });
    if (errors.length) {
      templateVars.errors = errors;
      return res.status(400).render("register", templateVars);
    }
    const userID = generateRandomString();
    const visitorID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    users[userID] = {
      id: userID,
      email,
      password: hashedPassword,
      visitorID,
    };
    req.session.userID = userID;
    req.session.visitorID = visitorID;
    res.redirect("/urls");
  });

  router.get("/login", (req, res) => {
    if (templateVars.user) return res.redirect("/urls");
    res.render("login", templateVars);
  });

  router.post("/login", (req, res) => {
    const { email, password } = req.body;
    const user = getUserByEmail(email, users);
    
    const errors = [];
    if (!user) errors.push({ msg: "You have entered an invalid email address."} );
    else if (!(bcrypt.compareSync(password, user.password))) errors.push({ msg: "Password is incorrect."} );
    if (errors.length) {
      templateVars.errors = errors;
      return res.status(403).render("login", templateVars);
    }

    req.session.userID = user.id;
    req.session.visitorID = user.visitorID;
    res.redirect("/urls");
  
  });
  
  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/users/login");
  });

  return router;
};

module.exports = userRouter;