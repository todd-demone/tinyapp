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

const isEmailAlreadyRegistered = function (email, users) {
  for (user_id in users) {
    if (users[user_id]["email"] === email) {
      return true;
    }
  }
  return false;
};

module.exports = { generateRandomString, isEmailAlreadyRegistered };
