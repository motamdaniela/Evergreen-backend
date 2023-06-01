const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const { app, server } = require("../index");
const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");
const { activities } = require("../models");

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

let token, tokenAdmin, user, activity

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

describe("GET /activities", () => {
  it("should get all activities", async () => {
    const res = await request(app)
      .get("/activities")
      .set("Authorization", `Bearer ${token}`); 
      
    expect(res.statusCode).toBe(200);
  });
});

describe('GET /activities/:activityID', () => {
  it('should get one activity', async () => {
    activity = await activities.create({
      'photo': 'https://cdn.pixabay.com/photo/2018/11/17/22/15/trees-3822149_960_720.jpg',
      'idTheme': '6466461a64186bf0efed6b6a',
      'date': 'fevereiro',
      'begin': '20230201',
      'end': '20230228',
      'description': ['description 1', 'description 2', 'desccription 3'],
      'title': 'plantação árvores',
      'coordinator': `${user.id}`,
      'place': 'campus 2',
      'users': []
    })
    const res = await request(app)
      .get(`/activities/${activity.id}`)
    expect(res.statusCode).toBe(200)
  })
});

describe('PATCH /activities/:activityID', () => {
  it('should subscribe to activity', async () => {
    const res = await request(app)
      .patch(`/activities/${activity.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
  })
});

describe('GET /activities/coordinator', () => {
  it('should get all activities from coordinator', async () => {
    const res = await request(app)
      .get('/activities/coordinator')
      .set('Authorization', `Bearer ${token} || ${tokenAdmin}`)
    expect(res.statusCode).toBe(200)
  });
});

describe('PATCH /activities/participation/:activityID/users/:userID', () => {
  it('should verify users presence', async () => {
    const res = await request(app)
      .patch(`/activities/participation/${activity.id}/users/${user.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
    expect(res.statusCode).toBe(200)
  })
});

describe('POST /activities/suggestion', () => {
  it("should create a suggestion", async () => {
    const res = await request(app)
      .post("/activities/suggestion")
      .set("Authorization", `Bearer ${token}`)
      .send({
        theme: 'Água',
        description: 'uma descrição',
        objectives: 'alguns objetivos',
        goals: 'whats the difference to this ^',
        resources: 'some resources',
        userID: `${user.id}`,
      });
    expect(res.statusCode).toBe(201);
  });
});