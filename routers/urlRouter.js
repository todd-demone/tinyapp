const express = require('express');
const router = express.Router();

const bcrypt = require("bcrypt");
const { urlsForUser, generateRandomString } = require("../helpers");

const urlRouter = (users, urlDatabase) => {

  router.get("/", (req, res) => {
    if (!req.session.userID) return res.redirect("/users/login");
    
    const templateVars = {
      urls: urlsForUser(req.session.userID, urlDatabase),
      user: users[req.session.userID],
    };
    res.render("urls_index", templateVars);
  });

  router.get("/new", (req, res) => {
    if (!req.session.userID) return res.redirect("/users/login");
    const templateVars = { user: users[req.session.userID] };
    res.render("urls_new", templateVars);
  });

  router.post("/", (req, res) => {
    const { longURL } = req.body;
    const shortURL = generateRandomString();
    
    if (!req.session.userID) return res.sendStatus(401);
    if (!longURL) {
      const templateVars = {
        user: users[req.session.userID],
        code: 400,
        message: "You didn't submit a URL. Please try again.",
      };
      return res.status(400).render("error", templateVars);
    }

    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: req.session.userID,
      visitorIDs: [],
      visitLog: [],
    };
    res.redirect(`/urls/${shortURL}`);
  });

  router.get("/:shortURL", (req, res) => {
    const { shortURL } = req.params;
    if (!req.session.userID) return res.redirect("/users/login");
    if (!(shortURL in urlDatabase)) {
      const templateVars = {
        user: users[req.session.userID],
        code: 404,
        message: "Page not found",
      };
      return res.status(404).render("error", templateVars);
    }
    if (req.session.userID !== urlDatabase[shortURL].userID) {
      const templateVars = {
        user: users[req.session.userID],
        code: 403,
        message: "You are not authorized to access this resource.",
      };
      return res.status(403).render("error", templateVars);
    }
    
    const templateVars = {
      shortURL,
      urlData: urlDatabase[shortURL],
      user: users[req.session.userID],
    };
    res.render("urls_show", templateVars);
  });

  router.put("/:shortURL", (req, res) => {
    const { shortURL } = req.params;
    const { longURL } = req.body;
    if (!req.session.userID) return res.sendStatus(401);
    if (!(shortURL in urlDatabase)) return res.sendStatus(404);
    if (req.session.userID !== urlDatabase[shortURL].userID) return res.sendStatus(403);
    if (!longURL) {
      const templateVars = {
        user: users[req.session.userID],
        code: 400,
        message: "You didn't edit the URL. Please try again.",
      };
      return res.status(400).render("error", templateVars);
    }

    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  });

  router.delete("/:shortURL", (req, res) => {
    const { shortURL } = req.params;
    if (!req.session.userID) return res.sendStatus(401);
    if (!(shortURL in urlDatabase)) return res.sendStatus(404);
    if (req.session.userID !== urlDatabase[shortURL].userID) return res.sendStatus(403);

    delete urlDatabase[shortURL];
    res.redirect("/urls");
  });

  return router;
};

module.exports = urlRouter;