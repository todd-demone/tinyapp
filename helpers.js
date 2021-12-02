/**
 * Returns a string of 6 random alphanumeric characters.
 * @param {number} length The number of characters to be included in the returned string.
 * @returns {string} 6 random alphanumeric characters [A-Za-z0-9].
 */
const generateRandomString = function() {
  const length = 6;
  const CHARACTERS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = CHARACTERS.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * Lookup a user using their email address; returns the object representing that user.
 * @param {string} email the user's email address.
 * @param {object} database a 'users' object; key is the userID; value is an object with id, email and password.
 * @returns {object} a single user object.
 */
const getUserByEmail = function(email, database) {
  for (const userID in database) {
    if (database[userID].email === email) return database[userID];
  }
};

/**
 * Returns the URLs where the userID is equal to the userID of the logged in user.
 * @param {string} userID
 * @param {object} urlDatabase a 'URLS' object; key is the shortURL; value is an object with longURL and userID.
 * @returns {object} a single URL object.
 */
const urlsForUser = function(userID, urlDatabase) {
  const results = {};
  const allShortURLs = Object.keys(urlDatabase);
  const filteredShortURLs = allShortURLs.filter( shortURL => urlDatabase[shortURL].userID === userID);
  for (const shortURL of filteredShortURLs) {
    results[shortURL] = urlDatabase[shortURL];
  }
  return results;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };
