const streak = require("./controllers/user.controller");

const user = {
  _id: 123,
  loginDate: 20230525,
  previousLoginDate: 20230523,
};

test("checks login date?", () => {
  expect(streak(user));
});
const sum = require("./sum");

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});
