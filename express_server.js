const express = require("express");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser"); // convert input to readable string in req.body
const cookieSession = require("cookie-session");
const {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
} = require("./helpers");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
app.set("view engine", "ejs");

const PORT = 8080;
const urlDatabase = {}; // b6UTxQ: { longURL: "http://www.tsn.ca", userID: "aJ48lW" },
const users = {}; // userRandomID: { id: "userRandomID",email: "user@example.com", password: "hashed-password", },
const LENGTH = 6; // length of the random string to be generated by generateRandomString()

// URLs

// GET /urls => Retrieves collection of URLs
app.get("/urls", (req, res) => {
  // User is not logged in
  if (!req.session.userID) {
    return res.redirect("/login");
  }

  const templateVars = {
    urls: urlsForUser(req.session.userID, urlDatabase),
    user: users[req.session.userID],
  };
  res.render("urls_index", templateVars);
});

// GET /urls/new => Renders a form that collects info about a new URL
app.get("/urls/new", (req, res) => {
  // User is not logged in
  if (!req.session.userID) {
    return res.redirect("/login");
  }

  const templateVars = { user: users[req.session.userID] };
  res.render("urls_new", templateVars);
});

// POST /urls => Creates a new URL
app.post("/urls", (req, res) => {
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

  const shortURL = generateRandomString(LENGTH);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.userID,
  };
  res.redirect(`/urls/${shortURL}`);
});

// GET /urls/:shortURL => Retrieve the URL with the specified id
app.get("/urls/:shortURL", (req, res) => {
  // User is not logged in
  if (!req.session.userID) {
    return res.redirect("/login");
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
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.userID],
  };
  res.render("urls_show", templateVars);
});

// PUT /urls/:shortURL -> updates a specific URL
app.post("/urls/:shortURL", (req, res) => {
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

  urlDatabase[req.params.shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.userID,
  };
  res.redirect("/urls");
});

// DELETE /urls/:shortURL/delete => deletes a specific URL
app.post("/urls/:shortURL/delete", (req, res) => {
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

// GET /u/shortURL => redirect to the corresponding long URL
app.get("/u/:shortURL", (req, res) => {
  // The shortURL doesn't exist 
  if (!(req.params.shortURL in urlDatabase)) {
    const templateVars = {
      user: users[req.session.userID],
      code: 404,
      message: "Page not found",
    };
    return res.status(404).render("error", templateVars);
  }

  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

// AUTHENTICATION

// GET /register => retrieve the register page
app.get("/register", (req, res) => {
  // User is already logged in
  if (req.session.userID) {
    return res.redirect("/urls");
  }

  res.render("register", { user: null });
});

// GET /login => retrieve the login page
app.get("/login", (req, res) => {
  // User is already logged in
  if (req.session.userID) {
    return res.redirect("/urls");
  }

  res.render("login", { user: null });
});

// POST /register => create a new user
app.post("/register", (req, res) => {
  // Email or password field is empty
  if (!req.body.email || !req.body.password) {
    const templateVars = {
      user: users[req.session.userID],
      code: 400,
      message: "Email or password are empty. Please try again.",
    };
    return res.status(400).render("error", templateVars);
  }

  // Account already exists
  const existingUser = getUserByEmail(req.body.email, users);
  if (existingUser) {
    const templateVars = {
      user: existingUser.id,
      code: 400,
      message: "This account already exists. Please login.",
    };
    return res.status(400).render("error", templateVars);
  }

  // Create an account
  const userID = generateRandomString(LENGTH);
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  req.session.userID = userID;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const existingUser = getUserByEmail(req.body.email, users);
  if (
    existingUser &&
    req.body.password &&
    bcrypt.compareSync(req.body.password, existingUser.password)
  ) {
    req.session.userID = existingUser.id;
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

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// catch-all for non-existing pages
// app.get("*", (req, res) => {
//   const templateVars = {
//     user: users[req.session.userID],
//     code: 404,
//     message: "Page not found",
//   };
//   res.render("error", templateVars);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
