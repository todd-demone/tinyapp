const express = require('express');
const router = express.Router();

const bcrypt = require("bcrypt");
const { urlsForUser, generateRandomString } = require("../helpers");

const urlRouter = (users, urlDatabase) => {

  router.get("/", (req, res) => {
    // User is not logged in
    if (!req.session.userID) {
      return res.redirect("/users/login");
    }
    const templateVars = {
      urls: urlsForUser(req.session.userID, urlDatabase),
      user: users[req.session.userID],
    };
    res.render("urls_index", templateVars);
  });

  router.get("/new", (req, res) => {
    // User is not logged in
    if (!req.session.userID) {
      return res.redirect("/users/login");
    }
    const templateVars = { user: users[req.session.userID] };
    res.render("urls_new", templateVars);
  });

  router.post("/", (req, res) => {
    // User is not logged in
    if (!req.session.userID) {
      return res.sendStatus(401);
    // User submitted an empty form
    } else if (!req.body.longURL) {
      const templateVars = {
        user: users[req.session.userID],
        code: 400,
        message: "You didn't submit a URL. Please try again.",
      };
      return res.status(400).render("error", templateVars);
    }

    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.userID,
      visitorIDs: [],
      visitLog: [],
    };
    res.redirect(`/urls/${shortURL}`);
  });

  router.get("/:shortURL", (req, res) => {
    // User is not logged in
    if (!req.session.userID) {
      return res.redirect("/users/login");
    // The shortURL doesn't exist
    } else if (!(req.params.shortURL in urlDatabase)) {
      const templateVars = {
        user: users[req.session.userID],
        code: 404,
        message: "Page not found",
      };
      return res.status(404).render("error", templateVars);
    // The URL belongs to another user (no permission)
    } else if (req.session.userID !== urlDatabase[req.params.shortURL].userID) {
      const templateVars = {
        user: users[req.session.userID],
        code: 403,
        message: "You are not authorized to access this resource.",
      };
      return res.status(403).render("error", templateVars);
    }
    const templateVars = {
      shortURL: req.params.shortURL,
      urlData: urlDatabase[req.params.shortURL],
      user: users[req.session.userID],
    };
    res.render("urls_show", templateVars);
  });

  // PUT /urls/:shortURL -> updates a specific URL
  router.put("/:shortURL", (req, res) => {
    // User is not logged in
    if (!req.session.userID) {
      return res.sendStatus(401);
    // The shortURL doesn't exist
    } else if (!(req.params.shortURL in urlDatabase)) {
      return res.sendStatus(404);
    // User submitted an empty form
    } else if (!req.body.longURL) {
      const templateVars = {
        user: users[req.session.userID],
        code: 400,
        message: "You didn't edit the URL. Please try again.",
      };
      return res.status(400).render("error", templateVars);
    // The URL belongs to another user (no permission)
    } else if (req.session.userID !== urlDatabase[req.params.shortURL].userID) {
      return res.sendStatus(403);
    }

    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  });

  // DELETE /urls/:shortURL/delete => deletes a specific URL
  router.delete("/:shortURL", (req, res) => {
    // User is  not logged in
    if (!req.session.userID) {
      return res.sendStatus(401);
    // The shortURL doesn't exist
    } else if (!(req.params.shortURL in urlDatabase)) {
      return res.sendStatus(404);
    // The URL belongs to another user (no permission)
    } else if (req.session.userID !== urlDatabase[req.params.shortURL].userID) {
      return res.sendStatus(403);
    }

    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  });

  return router;
};

module.exports = urlRouter;