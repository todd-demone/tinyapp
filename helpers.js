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

const getUserIdUsingEmail = function (email, users) {
  for (user_id in users) {
    if (users[user_id]["email"] === email) {
      return users[user_id].id;
    }
  }
};

// Returns the URLs where the user_id is equal to the user_id of the logged in user.
const urlsForUser = function (user_id, urlDatabase) {
  const results = {};
  const allShortURLs = Object.keys(urlDatabase);
  const filteredShortURLs = allShortURLs.filter(
    (shortURL) => urlDatabase[shortURL].userID === user_id
  );
  for (shortURL of filteredShortURLs) {
    results[shortURL] = urlDatabase[shortURL];
  }
  return results;
};

module.exports = { generateRandomString, getUserIdUsingEmail, urlsForUser };
