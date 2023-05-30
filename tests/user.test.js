require("dotenv").config();
const mongoose = require("mongoose");
const request = require("supertest");
const dbConfig = require("../config/db.config.js");
const app = require("../index");

const User = require("../models/users.model");

beforeEach(async () => {
  await mongoose.connect(dbConfig.URL);
});

afterEach(async () => {
  await mongoose.connection.close();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("POST /users/signup", () => {
  it("should create a user", async () => {
    const res = await request(app).post("/users/signup").send({
      email: "123@aaa",
      username: "aaaa",
      name: "Product 2",
      password: "123",
      school: "ESMAD",
    });
    expect(res.statusCode).toBe(201);
  });
});
