const express = require('express');
const router = express.Router();

const { generateRandomString } = require('../helpers');

const uRouter = (templateVars, users, urlDatabase) => {
  
  router.get("/:shortURL", (req, res) => {
    const { shortURL } = req.params;
    
    if (!(shortURL in urlDatabase)) return res.status(404).render("error404", templateVars);
    
    // assign a visitorID cookie for analytics
    if (!req.session.visitorID) req.session.visitorIDs = {};
    if (!(req.session.visitorIDs[shortURL])) {
      const visitorID = generateRandomString();
      req.session.visitorIDs[shortURL] = visitorID;
      if (templateVars.user) users[templateVars.user.id].visitorIDs[shortURL] = visitorID;
      urlDatabase[shortURL].visitorIDs.push(visitorID);
    }
  
    // log each visit (timestamp, visitorID)
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

