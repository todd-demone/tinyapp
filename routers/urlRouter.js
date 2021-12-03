const express = require('express');
const router = express.Router();

const { urlsForUser, generateRandomString } = require("../helpers");

const urlRouter = (templateVars, users, urlDatabase) => {

  router.get("/", (req, res) => {
    if (!templateVars.user) return res.redirect("/users/login");
    templateVars.urls = urlsForUser(req.session.userID, urlDatabase);
    res.render("urls_index", templateVars);
  });

  router.get("/new", (req, res) => {
    if (!templateVars.user) return res.redirect("/users/login");
    res.render("urls_new", templateVars);
  });

  router.post("/", (req, res) => {
    const { longURL } = req.body;
    const shortURL = generateRandomString();
    if (!templateVars.user) return res.sendStatus(401);
    if (!longURL) {
      templateVars.code = 400;
      templateVars.message = "You didn't submit a URL. Please try again.";
      return res.status(400).render("error", templateVars);
    }
    urlDatabase[shortURL] = {
      longURL,
      userID: req.session.userID,
      visitorIDs: [],
      visitLog: [],
    };
    res.redirect(`/urls/${shortURL}`);
  });

  router.get("/:shortURL", (req, res) => {
    const { shortURL } = req.params;
    if (!templateVars.user) return res.redirect("/users/login");
    if (!(shortURL in urlDatabase)) return res.status(404).render("error404", templateVars);
    if (templateVars.user.id !== urlDatabase[shortURL].userID) {
      templateVars[code] = 403;
      templateVars[message] = "You are not authorized to access this resource.";
      return res.status(403).render("error", templateVars);
    }
    templateVars.shortURL = shortURL;
    templateVars.urlData = urlDatabase[shortURL];
    res.render("urls_show", templateVars);
  });

  router.put("/:shortURL", (req, res) => {
    const { shortURL } = req.params;
    const { longURL } = req.body;
    if (!templateVars.user) return res.sendStatus(401);
    if (!(shortURL in urlDatabase)) return res.sendStatus(404);
    if (templateVars.user.id !== urlDatabase[shortURL].userID) return res.sendStatus(403);
    if (!longURL) {
      templateVars.code = 400;
      templateVars.message = "You didn't edit the URL. Please try again.";
      return res.status(400).render("error", templateVars);
    }
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  });

  router.delete("/:shortURL", (req, res) => {
    const { shortURL } = req.params;
    if (!templateVars.user) return res.sendStatus(401);
    if (!(shortURL in urlDatabase)) return res.sendStatus(404);
    if (templateVars.user.id !== urlDatabase[shortURL].userID) return res.sendStatus(403);
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  });

  return router;
};

module.exports = urlRouter;