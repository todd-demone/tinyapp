const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const methodOverride = require('method-override');

const userRouter = require('./routers/userRouter');
const urlRouter = require('./routers/urlRouter');
const uRouter = require('./routers/uRouter');

const app = express();
const port = 8080;

const urlDatabase = {}; // b6UTxQ: { longURL: "http://www.tsn.ca", userID: "aJ48lW", visitorIDs: [abc123, def456, ghi789], visitLog: [{ timestamp: 2021-12..., visitorID: abc123 }] },
const users = {}; // userRandomID: { id: "userRandomID", email: "user@example.com", password: "hashed-password", visitorIDs: { shortURL1: myVisitorID1, shortURL2: myVisitorID2 } },

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: "session", keys: ["key1", "key2"] }));
app.use(methodOverride('_method'));

app.use("/users", userRouter(users));
app.use("/urls", urlRouter(users, urlDatabase));
app.use("/u", uRouter(users, urlDatabase));

// catch-all for non-existing pages
// app.get("*", (req, res) => {
//   const templateVars = {
//     user: users[req.session.userID],
//     code: 404,
//     message: "Page not found",
//   };
//   res.render("error", templateVars);
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
