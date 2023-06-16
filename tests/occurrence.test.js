const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const { app, server } = require("../index");
const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");
const { schools } = require("../models");

let mongoServer;

let token = "";
let tokenAdmin = "";
tokenSecurity = "";
let ocID = "";
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

// criacao de utilizadores (um user e um admin e um para securiry) para poder ter acesso às funcionalidades a testar
describe("POST /users/signup", () => {
  it("should create a user", async () => {
    // * o it é o que é suposto fazer
    // * tem de ter it para cada resposta possível
    // * vai à app buscar o router acho e tens de por o método e a rota
    const res = await request(app).post("/users/signup").send({
      // * o send envia as cenas que deveriam estar no body
      email: "user@example.com",
      username: "user",
      name: "user",
      password: "123",
      confPassword: "123",
      school: "ESMAD",
    });
    // * recebes o status code que deu + o esperado
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
      email: "security@example.com",
      username: "security",
      name: "security",
      password: "123",
      confPassword: "123",
      school: "ESMAD",
    });
    expect(res.statusCode).toBe(201);
  });
});
//login dos utilizadores criados
describe("POST /users/login", () => {
  it("should login as user", async () => {
    const res = await request(app).post("/users/login").send({
      username: "user",
      password: "123",
    });
    // * ele obteve de resposta o token então aqui guarda
    token = res.body.accessToken;
    let decoded = jwt.verify(token, config.SECRET);
    // * user logado
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
      username: "security",
      password: "123",
    });
    tokenSecurity = res.body.accessToken;
    expect(res.statusCode).toBe(200);
  });
});

//start of the occurrence tests

//rota /occurences
//get
describe("GET /occurrences", () => {
  //get occurrences as admin
  it("should get all occurrences", async () => {
    const res = await request(app)
      .get("/occurrences")
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
  });
  it("invalid get all occurrences", async () => {
    const res = await request(app)
      .get("/occurrences")
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).not.toBe(403);
  });

  //get occurrences as security
  it("should get all occurrences as security", async () => {
    const res = await request(app)
      .get("/occurrences")
      .set("Authorization", `Bearer ${tokenSecurity}`);
    expect(res.statusCode).toBe(200);
  });

  //get occurrences as user
  it("should get user's occurrences", async () => {
    const res = await request(app)
      .get("/occurrences")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  //get occurrences while not logged in(shouldnt get access)
  it("should not get occurrences", async () => {
    const res = await request(app).get("/occurrences");
    expect(res.statusCode).toBe(401);
  });
});

//post
describe("POST /occurrences", () => {
  //post occurrence as user
  it("should post new occurrence", async () => {
    school = await schools.create({
      name: "ESMAD",
      buildings: [{ name: "A", classrooms: [201, 202] }],
    });

    const res = await request(app)
      .post("/occurrences")
      .set("Authorization", `Bearer ${token}`)
      .send({
        school: "ESMAD",
        building: "A",
        classroom: "101",
        type: "Lâmpada fundida",
        description: "luz ligada numa sala vazia",
        photo: "aaaa",
      });
    ocID = res.body.occurrence._id;
    expect(res.statusCode).toBe(201);
  });

  //post occurrence as admin(shouldnt be allowed)
  it("should not authorize to post new occurrence", async () => {
    const res = await request(app)
      .post("/occurrences")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        school: "ESMAD",
        building: "A",
        classroom: "201",
        type: "Luz ligada",
        description: "luz ligada numa sala vazia",
        photo: "#",
      });
    expect(res.statusCode).toBe(403);
  });

  //post ocurrence with a null field item
  it("should ask to provide field", async () => {
    const res = await request(app)
      .post("/occurrences")
      .set("Authorization", `Bearer ${token}`)
      .send({
        school: "",
        building: "A",
        classroom: "201",
        type: "Luz ligada",
        description: "luz ligada numa sala vazia",
        photo: "#",
      });
    expect(res.statusCode).toBe(400);
  });

  //post ocurrence with invalid school(does not exist)
  it("should say school does not exist", async () => {
    const res = await request(app)
      .post("/occurrences")
      .set("Authorization", `Bearer ${token}`)
      .send({
        school: "madeupschool",
        building: "A",
        classroom: "201",
        type: "Luz ligada",
        description: "luz ligada numa sala vazia",
        photo: "#",
      });

    expect(res.statusCode).toBe(400);
  });

  //post ocurrence with invalid building(does not exist)
  it("should say building does not exist", async () => {
    const res = await request(app)
      .post("/occurrences")
      .set("Authorization", `Bearer ${token}`)
      .send({
        school: "ESMAD",
        building: "E",
        classroom: "201",
        type: "Luz ligada",
        description: "luz ligada numa sala vazia",
        photo: "#",
      });
    expect(res.statusCode).toBe(400);
  });
});

//rota /occurences/:ocID
//get
describe("GET /occurrences/:ocID", () => {
  //get occurrence as admin
  it("should get specific occurrence", async () => {
    const res = await request(app)
      .get(`/occurrences/${ocID}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
  });

  //get occurrence as Security
  it("should get specific occurrence as security", async () => {
    const res = await request(app)
      .get(`/occurrences/${ocID}`)
      .set("Authorization", `Bearer ${tokenSecurity}`);
    expect(res.statusCode).toBe(200);
  });

  //get occurrence as user(should not be allowed)
  it("should not get specific occurrence", async () => {
    const res = await request(app)
      .get(`/occurrences/${ocID}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });

  //invalid occurrence id
  it("should not find occurrence", async () => {
    const res = await request(app)
      .get(`/occurrences/6479cd59008f5279e2157787`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(404);
  });
});

//put
describe("PATCH /occurrences/:ocID", () => {
  //change occurrence's state as an admin
  it("should change occurrence's state", async () => {
    const res = await request(app)
      .patch(`/occurrences/${ocID}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        state: "solved",
      });
    expect(res.statusCode).toBe(200);
  });

  //change occurrence's state as an Security
  it("should change occurrence's state as security", async () => {
    const res = await request(app)
      .patch(`/occurrences/${ocID}`)
      .set("Authorization", `Bearer ${tokenSecurity}`)
      .send({
        state: "pending",
      });
    expect(res.statusCode).toBe(200);
  });

  //change occurrence's state as user(should not get access)
  it("should say requires admin or security user", async () => {
    const res = await request(app)
      .patch(`/occurrences/${ocID}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        state: "solved",
      });
    expect(res.statusCode).toBe(403);
  });

  //invalid occurrence id
  it("should not be able to find occurrence", async () => {
    const res = await request(app)
      .put(`/occurrences/6479cd59008f5279e2157787`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        state: "solved",
      });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /occurrences/:ocID", () => {
  it("should delete occurrence", async () => {
    const res = await request(app)
      .delete(`/occurrences/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(204);
  });

  it("should say requires admin role", async () => {
    const res = await request(app)
      .delete(`/occurrences/${user.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });
});
