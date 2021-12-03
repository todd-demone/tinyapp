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
    if (user) errors.push({ msg: "Error - this account already exists." });
    if (!email || !password) errors.push({ msg: "Error - email or password are empty. Please try again." });
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
    
    if (user && password && bcrypt.compareSync(password, user.password)) {
      req.session.userID = user.id;
      req.session.visitorID = user.visitorID;
      return res.redirect("/urls");
    } 
    
    const errors = [];
    if (!user) errors.push({ msg: "Error - email address can't be found."} );
    else if (!(bcrypt.compareSync(password, user.password))) errors.push({ msg: "Error - password is incorrect."} );
    if (errors.length) {
      templateVars.errors = errors;
      return res.status(403).render("login", templateVars);
    }
     
  });
  
  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/users/login");
  });

  return router;
};

module.exports = userRouter;