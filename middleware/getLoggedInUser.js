const getLoggedInUser = (templateVars, users) => (req, res, next) => {
  const { userID } = req.session;
  const user = users[userID];
  templateVars.user = user ? { id: userID, email: user.email } : null;
  next();
};

module.exports = getLoggedInUser;