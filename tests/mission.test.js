const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const { app, server } = require("../index");
const { missions } = require("../models");
const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");

let mongoServer;

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

let token, tokenAdmin, mission, user;

// * signup
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

// *login
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

// * get all missions
describe("GET /missions", () => {
  it("should get all missions", async () => {
    const res = await request(app)
      .get("/missions")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});

// * receive badge
describe("PATCH /missions", () => {
  it("should receive mission badge", async () => {
    const res = await request(app)
      .patch("/missions")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it("should say user role is required", async () => {
    const res = await request(app)
      .patch("/missions")
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(403);
  });
});

// * get one mission
describe("GET /missions/:missionID", () => {
  it("should get one mission", async () => {
    mission = await missions.create({
      title: "inscrever na primeira atividade",
      description: "escolhe uma atividade que gostavas de participar",
      reward: "src/assets/images/inscrever_1.png",
      users: [],
      max: 1,
      type: 0,
    });
    const res = await request(app).get(`/missions/${mission.id}`);
    expect(res.statusCode).toBe(200);
  });

  it("should say mission doesnt exist", async () => {
    const res = await request(app).get("/missions/6475de6221aff7ae2937c703");
    expect(res.statusCode).toBe(404);
  });

  it("should say id is not valid", async () => {
    const res = await request(app).get("/missions/...");
    expect(res.statusCode).toBe(400);
  });
});

// * delete from mission
describe("DELETE /missions/:userID", () => {
  it("should delete user from mission", async () => {
    const res = await request(app)
      .delete(`/missions/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(204);
  });

  it("should say you it requires admin role", async () => {
    const res = await request(app)
      .delete(`/missions/${user.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });
});

// * update mission
describe("PATCH /update", () => {
  it("should update mission", async () => {
    const res = await request(app)
      .patch(`/missions/update`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        missions: [
          {
            _id: mission.id,
            users: [{ user: user.id, status: 5 }],
          },
        ],
      });
    expect(res.statusCode).toBe(200);
  });
});
