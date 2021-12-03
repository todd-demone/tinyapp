const { assert } = require("chai");
const { getUserByEmail, urlsForUser } = require("../helpers");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
    visitorID: "abc123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
    visitorID: "def456",
  },
};

const testUrlDatabase = {
  abc123: {
    longURL: "http://www.tsn.ca",
    userID: "aj48lW",
    visitorIDs: ["123adF", "asdflk", "234jka"],
    visitLog: [
      {
        timestamp: "2021-12-03",
        visitorID: "asl556",
      },
      {
        timestamp: "2021-12-03",
        visitorID: "aj48lW",
      },
    ],
  },
  asdfk7: {
    longURL: "http://example.edu",
    userID: "asl556",
    visitorIDs: ["adsf34", "kj34kj", "retr54"],
    visitLog: [
      {
        timestamp: "2021-12-03",
        visitorID: "asl556",
      },
      {
        timestamp: "2021-12-03",
        visitorID: "asl556",
      },
    ],
  },
  adf678: {
    longURL: "http://www.nhl.com",
    userID: "aj48lW",
    visitorIDs: ["adsfdf", "dfsedf", "vcbnnm"],
    visitLog: [
      {
        timestamp: "2021-12-01",
        visitorID: "asl556",
      },
      {
        timestamp: "2021-11-03",
        visitorID: "aj48lW",
      },
    ],
  },
};

const urlsTestResults = {
  abc123: {
    longURL: "http://www.tsn.ca",
    userID: "aj48lW",
    visitorIDs: ["123adF", "asdflk", "234jka"],
    visitLog: [
      {
        timestamp: "2021-12-03",
        visitorID: "asl556",
      },
      {
        timestamp: "2021-12-03",
        visitorID: "aj48lW",
      },
    ],
  },
  adf678: {
    longURL: "http://www.nhl.com",
    userID: "aj48lW",
    visitorIDs: ["adsfdf", "dfsedf", "vcbnnm"],
    visitLog: [
      {
        timestamp: "2021-12-01",
        visitorID: "asl556",
      },
      {
        timestamp: "2021-11-03",
        visitorID: "aj48lW",
      },
    ],
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
    assert.strictEqual(user, null);
  });
});

describe("urlsForUser", () => {
  it("should return 2 URL records for userID 'aj48lW'", () => {
    assert.deepEqual(urlsForUser("aj48lW", testUrlDatabase), urlsTestResults);
  });
});
