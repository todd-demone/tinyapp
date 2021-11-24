const express = require("express");
// body-parser library
// converts the request body from a Buffer to a string that we can read.
// It will then add a JS object to the `req` object under the  key `body`.
// The input field of our form will be available under `req.body.longURL`
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;
const LENGTH = 6;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// "if you receive an HTTP request with a GET method and a /urls path, render this template and use these variables when you're rendering"
// app.get(path, callback)
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  // res.render('myTemplate', myObjectContainingVariables)
  res.render("urls_index", templateVars);
});

// a GET route to render the urls_new.ejs template
// This route definition must come before /urls/:id because Express will think /urls/new is a call to that one.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// a POST route to receive and process the form submission
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(LENGTH);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// :shortURL ends up in req.params
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

/**
 * Returns a string of 6 random alphanumeric characters
 * @param {number} length The number of characters to be included in the returned string
 * @returns String a string of 6 random alphanumeric characters [A-Za-z0-9]
 */
const generateRandomString = function (length) {
  const CHARACTERS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = CHARACTERS.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
