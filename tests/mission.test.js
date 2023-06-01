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

describe('GET /missions', () => {
    it('should get all missions', async () => {
        const res = await request(app)
            .get('/missions')
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe('PATCH /missions', () => {
    it('should receive mission badge', async () => {
        const res = await request(app)
            .patch('/missions')
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

