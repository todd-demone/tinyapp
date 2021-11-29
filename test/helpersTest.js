const { assert } = require("chai");

const { getUserByEmail } = require("../helpers");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", () => {
  it("should return a user with a valid email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput);
  });
  it("should return undefined when given a non-existent email", () => {
    const user = getUserByEmail("notauser@example.com", testUsers);
    assert.strictEqual(user, undefined);
  });
});
