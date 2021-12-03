const express = require('express');
const router = express.Router();

const { generateRandomString } = require('../helpers');

const uRouter = (users, urlDatabase) => {
  
  router.get("/:shortURL", (req, res) => {
    const { shortURL } = req.params;
    const userID = req.session.userID || null;
    const user = users[userID] || null;
    
    if (!(shortURL in urlDatabase)) return res.status(404).render("error404", { user });
    if (!req.session.visitorIDs) req.session.visitorIDs = {};
    if (!(req.session.visitorIDs[shortURL])) {
      const visitorID = generateRandomString();
      req.session.visitorIDs[shortURL] = visitorID;
      if (user && !(user.visitorIDs[shortURL])) {
        user.visitorIDs[shortURL] = visitorID;
      }
      urlDatabase[shortURL].visitorIDs.push(visitorID);
    }
  
    // keep track of every visit (timestamp, visitorID)
    const visitDetails = {
      timestamp: new Date(),
      visitorID: req.session.visitorIDs[shortURL],
    };
    urlDatabase[shortURL].visitLog.push(visitDetails);
    res.redirect(urlDatabase[shortURL].longURL);
  });

  return router;
};

module.exports = uRouter;

