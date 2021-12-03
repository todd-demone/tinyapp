const express = require("express");
const router = express.Router();

const { urlsForUser, generateRandomString } = require("../helpers");

const urlRouter = (templateVars, urlDatabase) => {
  router.get("/", (req, res) => {
    const { userID } = req.session;

    const errors = [];
    if (!templateVars.user)
      errors.push({
        msg: "Please login or register before trying to access URLs.",
      });
    if (errors.length) {
      templateVars.errors = errors;
      return res.render("login", templateVars);
    }

    templateVars.urls = urlsForUser(userID, urlDatabase);
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

    const errors = [];
    if (!longURL) errors.push({ msg: "URL field cannot be empty." });
    if (errors.length) {
      templateVars.errors = errors;
      return res.render("urls_new", templateVars);
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

    const errors = [];
    if (!templateVars.user)
      errors.push({
        msg: "Please login or register before trying to access URLs.",
      });
    if (errors.length) {
      templateVars.errors = errors;
      return res.render("login", templateVars);
    }
    if (!(shortURL in urlDatabase))
      return res.status(404).render("error404", templateVars);
    if (templateVars.user.id !== urlDatabase[shortURL].userID)
      return res.status(403).render("error403", templateVars);

    templateVars.shortURL = shortURL;
    templateVars.urlData = urlDatabase[shortURL];
    res.render("urls_show", templateVars);
  });

  router.put("/:shortURL", (req, res) => {
    const { shortURL } = req.params;
    const { longURL } = req.body;

    if (!templateVars.user) return res.sendStatus(401);
    if (!(shortURL in urlDatabase)) return res.sendStatus(404);
    if (templateVars.user.id !== urlDatabase[shortURL].userID)
      return res.sendStatus(403);

    const errors = [];
    if (!longURL) errors.push({ msg: "URL field cannot be empty." });
    if (errors.length) {
      templateVars.errors = errors;
      return res.render("urls_show", templateVars);
    }

    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  });

  router.delete("/:shortURL", (req, res) => {
    const { shortURL } = req.params;
    if (!templateVars.user) return res.sendStatus(401);
    if (!(shortURL in urlDatabase)) return res.sendStatus(404);
    if (templateVars.user.id !== urlDatabase[shortURL].userID)
      return res.sendStatus(403);
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  });

  return router;
};

module.exports = urlRouter;
