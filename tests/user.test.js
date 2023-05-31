const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const { app, server } = require("../index");
const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");

let mongoServer;

let token = "";
let tokenAdmin = "";
let user = "";
beforeAll(async () => {
  await mongoose.disconnect();
  mongoServer = new MongoMemoryServer();
  await mongoServer.start();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  server.close();
});

describe("POST /users/signup", () => {
  it("should create a user", async () => {
    const res = await request(app).post("/users/signup").send({
      email: "user@example.com",
      username: "user",
      name: "user",
      password: "123",
      confPassword: "123",
      school: "ESMAD",
    });
    expect(res.statusCode).toBe(201);
  });
  it("should create a admin", async () => {
    const res = await request(app).post("/users/signup").send({
      type: "admin",
      email: "admin@example.com",
      username: "admin",
      name: "admin",
      password: "123",
      confPassword: "123",
      school: "ESMAD",
    });
    expect(res.statusCode).toBe(201);
  });
});

describe("POST /users/login", () => {
  it("should login as user", async () => {
    const res = await request(app).post("/users/login").send({
      username: "user",
      password: "123",
    });
    token = res.body.accessToken;
    let decoded = jwt.verify(token, config.SECRET);
    user = { id: decoded.id, type: decoded.type };
    expect(res.statusCode).toBe(200);
  });

  it("should login as admin", async () => {
    const res = await request(app).post("/users/login").send({
      username: "admin",
      password: "123",
    });
    tokenAdmin = res.body.accessToken;
    expect(res.statusCode).toBe(200);
  });
});

describe("GET /users", () => {
  it("should get all users type user", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
  it("should get all users", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
  });
});

describe("PATCH /users/council", () => {
  it("user should subscribe council ", async () => {
    const res = await request(app)
      .patch("/users/council")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});

describe("POST /users/createAdmin", () => {
  it("should create a admin", async () => {
    const res = await request(app)
      .post("/users/createAdmin")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        type: "admin",
        email: "admin2@example.com",
        username: "admin2",
        password: "123",
        name: "admin2",
        confPassword: "123",
      });
    expect(res.statusCode).toBe(201);
  });
  it("should create a security", async () => {
    const res = await request(app)
      .post("/users/createAdmin")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        type: "security",
        email: "security@example.com",
        username: "security",
        password: "123",
        name: "security",
        confPassword: "123",
      });
    expect(res.statusCode).toBe(201);
  });
});

describe("PATCH /users/dailyReward", () => {
  it("user should receive reward", async () => {
    const res = await request(app)
      .patch(`/users/dailyReward`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});

describe("PATCH /users/adminEdit/:userID", () => {
  it("admin should edit password", async () => {
    const res = await request(app)
      .patch(`/users/adminEdit/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        password: "1234",
        confPassword: "1234",
      });
    expect(res.statusCode).toBe(200);
  });
});

describe("PATCH /users/edit/:userID", () => {
  it("should edit user profile", async () => {
    const res = await request(app)
      .patch(`/users/edit/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "nome",
        photo: "link",
        password: "1234",
        confPassword: "1234",
      });
    expect(res.statusCode).toBe(200);
  });
});

describe("BLOCK /users/:userID", () => {
  it("should block user", async () => {
    const res = await request(app)
      .patch(`/users/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        state: "blocked",
      });
    expect(res.statusCode).toBe(200);
  });
  it("should activate user", async () => {
    const res = await request(app)
      .patch(`/users/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        state: "active",
      });
    expect(res.statusCode).toBe(200);
  });
});

describe("DELETE /users/:userID", () => {
  it("should delete user", async () => {
    const res = await request(app)
      .delete(`/users/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(204);
  });
});
