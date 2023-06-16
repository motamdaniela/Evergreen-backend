const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const { app, server } = require("../index");
const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");
const { activities } = require("../models");
const { themes } = require("../models");

let mongoServer;

beforeAll(async () => {
  await mongoose.disconnect();
  // const response = await request(app).get("/authentication/test");
  // token = response.body.token;
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

let token, tokenAdmin, tokenSecurity, user, activity, theme;

// * signup
describe("POST /users/signup", () => {
  it("should create a user", async () => {
    const res = await request(app).post("/users/signup").send({
      email: "user3@example.com",
      username: "user3",
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
  it("should create a security", async () => {
    const res = await request(app).post("/users/signup").send({
      type: "security",
      email: "sec@example.com",
      username: "sec",
      name: "sec",
      password: "123",
      confPassword: "123",
      school: "ESMAD",
    });
    expect(res.statusCode).toBe(201);
  });
});

// * login
describe("POST /users/login", () => {
  it("should login as user", async () => {
    const res = await request(app).post("/users/login").send({
      username: "user3",
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

  it("should login as security", async () => {
    const res = await request(app).post("/users/login").send({
      username: "sec",
      password: "123",
    });
    tokenSecurity = res.body.accessToken;
    expect(res.statusCode).toBe(200);
  });
});

// * get all activities
describe("GET /activities", () => {
  it("should get all activities", async () => {
    const res = await request(app)
      .get("/activities")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});

// * get one activity
describe("GET /activities/:activityID", () => {
  it("should get one activity", async () => {
    activity = await activities.create({
      photo:
        "https://cdn.pixabay.com/photo/2018/11/17/22/15/trees-3822149_960_720.jpg",
      idTheme: "6466461a64186bf0efed6b6a",
      date: "fevereiro",
      begin: "20230201",
      end: "20230228",
      description: ["description 1", "description 2", "desccription 3"],
      title: "plantação árvores",
      coordinator: `${user.id}`,
      place: "campus 2",
      users: [],
    });
    theme = await themes.create({
      name: "Água",
      color: "#ffffff",
    });
    const res = await request(app).get(`/activities/${activity.id}`);
    expect(res.statusCode).toBe(200);
  });

  it("should say activity doesnt exist", async () => {
    const res = await request(app).get("/activities/6475de6221aff7ae2937c703");
    expect(res.statusCode).toBe(404);
  });

  it("should say id is not valid", async () => {
    const res = await request(app).get("/activities/...");
    expect(res.statusCode).toBe(400);
  });
});

// * subscribe to an activity
describe("PATCH /activities/:activityID", () => {
  it("should subscribe to activity", async () => {
    const res = await request(app)
      .patch(`/activities/${activity.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it("should say user role is required", async () => {
    const res = await request(app)
      .patch(`/activities/${activity.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(403);
  });

  it("should say activity does not exist", async () => {
    const res = await request(app)
      .patch("/activities/6475de6221aff7ae2937c703")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });

  it("should say id is not valid", async () => {
    const res = await request(app)
      .patch("/activities/...")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });
});

// * find subscribed
describe("GET /activities/subscribed", () => {
  it("should get subscribed activities", async () => {
    const res = await request(app)
      .get(`/activities/subscribed`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it("should say it requires user role", async () => {
    const res = await request(app)
      .get(`/activities/subscribed`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(403);
  });
});

// * get all activities from coordinator
describe("GET /activities/coordinator", () => {
  it("should get all activities from coordinator", async () => {
    const res = await request(app)
      .get("/activities/coordinator")
      .set("Authorization", `Bearer ${token} || ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
  });

  it("should say user or admin role is required", async () => {
    const res = await request(app)
      .get("/activities/coordinator")
      .set("Authorization", `Bearer ${tokenSecurity}`);
    expect(res.statusCode).toBe(403);
  });

  it("should say you are not the coordinator of any activity", async () => {
    const res = await request(app)
      .get("/activities/coordinator")
      .set("Authorization", `Bearer ${tokenSecurity}`);
    expect(res.statusCode).toBe(403);
  });
});

// * verify participation
describe("PATCH /activities/participation/:activityID/users/:userID", () => {
  it("should verify users presence", async () => {
    const res = await request(app)
      .patch(`/activities/participation/${activity.id}/users/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
  });

  it("should say admin/user role is required", async () => {
    const res = await request(app)
      .patch(`/activities/participation/${activity.id}/users/${user.id}`)
      .set("Authorization", `Bearer ${tokenSecurity}`);
    expect(res.statusCode).toBe(403);
  });

  it("should say id is not valid", async () => {
    const res = await request(app)
      .patch(`/activities/participation/.../users/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(400);
  });
});

// * activity suggestion
describe("POST /activities/suggestion", () => {
  it("should create a suggestion", async () => {
    const res = await request(app)
      .post("/activities/suggestion")
      .set("Authorization", `Bearer ${token}`)
      .send({
        theme: "Água",
        description: "uma descrição",
        objectives: "alguns objetivos",
        goals: "metas",
        resources: "recursos necessarios",
      });

    expect(res.statusCode).toBe(201);
  });

  it("should say user role is required", async () => {
    const res = await request(app)
      .post("/activities/suggestion")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        theme: "Água",
        description: "uma descrição",
        objectives: "alguns objetivos",
        goals: "metas",
        resources: "recursos necessarios",
      });
    expect(res.statusCode).toBe(403);
  });

  it("should say theme is invalid", async () => {
    const res = await request(app)
      .post("/activities/suggestion")
      .set("Authorization", `Bearer ${token}`)
      .send({
        theme: "Tema?",
        description: "uma descrição",
        objectives: "alguns objetivos",
        goals: "metas",
        resources: "recursos necessarios",
      });
    expect(res.statusCode).toBe(400);
  });
});

// * delete from activity
describe("DELETE /activities/:userID", () => {
  it("should delete an activity", async () => {
    const res = await request(app)
      .delete(`/activities/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(204);
  });

  it("should say admin role is required", async () => {
    const res = await request(app)
      .delete(`/activities/${user.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });
});
