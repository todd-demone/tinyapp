const getLoggedInUser = function(templateVars, users) {
  return function(req, res, next) {
    const { userID } = req.session;
    const user = users[userID];
    templateVars.user = user ? { id: userID, email: user.email } : null;
    templateVars.errors = null;
    next();
  };
};

module.exports = getLoggedInUser;
