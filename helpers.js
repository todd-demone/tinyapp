/**
 * Returns a string of 6 random alphanumeric characters.
 * @returns {string} 6 random alphanumeric characters [A-Za-z0-9].
 */
const generateRandomString = () => {
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
 * @param {object} users an object where key is the userID; value is an object with id, email and password.
 * @returns {object} a single user object.
 */
const getUserByEmail = (email, users) => {
  for (const userID in users) {
    if (users[userID].email === email) return users[userID];
  }
  return null;
};

/**
 * Returns the URLs where the userID is equal to the userID of the logged in user.
 * @param {string} userID
 * @param {object} urlDatabase a 'URLS' object; key is the shortURL; value is an object with longURL and userID.
 * @returns {object} a single URL object.
 */
const urlsForUser = (userID, urlDatabase) => {
  const results = {};
  const allShortURLs = Object.keys(urlDatabase);
  const filteredShortURLs = allShortURLs.filter(
    (shortURL) => urlDatabase[shortURL].userID === userID
  );
  for (const shortURL of filteredShortURLs) {
    results[shortURL] = urlDatabase[shortURL];
  }
  return results;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };
