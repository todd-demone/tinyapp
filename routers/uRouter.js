const express = require('express');
const router = express.Router();

const { generateRandomString } = require('../helpers');

const uRouter = (templateVars, urlDatabase) => {
  
  router.get("/:shortURL", (req, res) => {
    const { shortURL } = req.params;
    
    if (!(shortURL in urlDatabase)) return res.status(404).render("error404", templateVars);
    
    // if not logged in, assign a visitorID cookie for analytics
    if (!req.session.visitorID) {
      const visitorID = generateRandomString();
      req.session.visitorID = visitorID;
    } 
    
    // count unique visitors to this URL
    urlDatabase[shortURL].visitorIDs.indexOf(req.session.visitorID) === -1 ? urlDatabase[shortURL].visitorIDs.push(req.session.visitorID) : null;
      
    // log each visit (timestamp, visitorID)
    const visitDetails = {
      timestamp: new Date(),
      visitorID: req.session.visitorID,
    };
    urlDatabase[shortURL].visitLog.push(visitDetails);

    res.redirect(urlDatabase[shortURL].longURL);
  });

  return router;
};

module.exports = uRouter;

