require("dotenv").config();
const app = require("../index");
const mongoose = require("mongoose");
const request = require("supertest");
const dbConfig = require("../config/db.config.js");

beforeAll(async () => {
  console.log(dbConfig.URL);
  await mongoose.connect(dbConfig.URL);
});

// beforeEach(async () => {
//   await User.deleteMany({});
// });

afterAll(async () => {
  // await User.deleteMany({});
  await mongoose.connection.close();
});

describe("POST /users/signup", () => {
  it("should create a user", async () => {
    const res = await request(app).post("/users/signup").send({
      email: "aiiiii",
      username: "aiii",
      name: "Product 2",
      password: "123",
      school: "ESMAD",
    });
    expect(res.statusCode).toBe(201);
  });
});

describe("POST /users/login", () => {
  it("should login a user", async () => {
    const res = await request(app).post("/users/signup").send({
      username: "aaaa",
      password: "123",
    });
    expect(res.statusCode).toBe(200);
  });
});
