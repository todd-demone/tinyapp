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
const LENGTH = 6; // length of random string to be generated by generateRandomString()

/* ROUTES
1. GET /register
2. POST /register
3. GET /login
4. POST /login
5. POST /logout
6. GET /urls - list of user's URLs
7. GET /urls/new - form for creating URL - route must come before /urls/:shortURL
8. POST /urls - create new URL
9. GET /urls/:shortURL - details about specific URL; form for updating URL
10. POST /urls/:shortURL - update URL
11. POST /urls/:shortURL/delete
12. GET /u/:shortURL - redirect to longURL
*/
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.userID],
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const existingUser = getUserByEmail(inputEmail, users);
  if (inputEmail && inputPassword && !existingUser) {
    const userID = generateRandomString(LENGTH);
    const hashedPassword = bcrypt.hashSync(inputPassword, 10);
    users[userID] = {
      id: userID,
      email: inputEmail,
      password: hashedPassword,
    };
    req.session.userID = userID;
    return res.redirect("/urls");
  }
  res.sendStatus(400);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.userID],
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const inputEmail = req.body.email;
  const existingUser = getUserByEmail(inputEmail, users);
  const inputPassword = req.body.password;
  if (
    existingUser &&
    bcrypt.compareSync(inputPassword, existingUser.password)
  ) {
    req.session.userID = existingUser.id;
    return res.redirect("/urls");
  }
  res.sendStatus(403);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const userIDCookie = req.session.userID;
  if (userIDCookie) {
    const templateVars = {
      urls: urlsForUser(userIDCookie, urlDatabase),
      user: users[userIDCookie],
    };
    return res.render("urls_index", templateVars);
  }
  res.send("something went wrong");
});

app.get("/urls/new", (req, res) => {
  const userIDCookie = req.session.userID;
  if (userIDCookie) {
    const templateVars = {
      user: users[userIDCookie],
    };
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(LENGTH);
  const longURL = req.body.longURL;
  const userIDCookie = req.session.userID;
  urlDatabase[shortURL] = { longURL: longURL, userID: userIDCookie };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const inputURL = req.params.shortURL;
  const userIDCookie = req.session.userID;
  if (
    inputURL in urlDatabase &&
    userIDCookie === urlDatabase[inputURL].userID
  ) {
    const templateVars = {
      shortURL: inputURL,
      longURL: urlDatabase[inputURL].longURL,
      user: users[userIDCookie],
    };
    return res.render("urls_show", templateVars);
  }
  res.send("something went wrong");
});

app.post("/urls/:shortURL", (req, res) => {
  const inputURL = req.params.shortURL;
  const userIDCookie = req.session.userID;
  const newLongURL = req.body.newLongURL;
  if (newLongURL && userIDCookie === urlDatabase[inputURL].userID) {
    urlDatabase[inputURL] = {
      longURL: newLongURL,
      userID: userIDCookie,
    };
    return res.redirect("/urls");
  }
  res.send("something went wrong");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const inputURL = req.params.shortURL;
  const userIDCookie = req.session.userID;
  if (userIDCookie === urlDatabase[inputURL].userID) {
    delete urlDatabase[inputURL];
    return res.redirect("/urls");
  }
  res.send("something went wrong");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
