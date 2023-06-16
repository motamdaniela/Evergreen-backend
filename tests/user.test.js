// * começo de cenas que sao iguais para todos os testes
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const { app, server } = require("../index");
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

// * final de cenas que sao iguais para todos os testes

let token, tokenAdmin, tokenSecurity, user, admin;

// * tens de fazer sempre signup e login para ter a autorização
// * isto descreve basicamente a rota é tipo console.log
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
      email: "sec@example.com",
      username: "sec",
      name: "sec",
      password: "123",
      confPassword: "123",
      school: "ESMAD",
    });
    expect(res.statusCode).toBe(201);
  });
  it("should ask to provide field", async () => {
    const res = await request(app).post("/users/signup").send({
      type: "admin",
      email: "",
      username: "admin123",
      name: "admin",
      password: "123",
      confPassword: "123",
      school: "ESMAD",
    });
    expect(res.statusCode).toBe(400);
  });
  it("should say you can't have spaces in your username", async () => {
    const res = await request(app).post("/users/signup").send({
      type: "admin",
      email: "admin123@example.com",
      username: "admin 123",
      name: "admin",
      password: "123",
      confPassword: "123",
      school: "ESMAD",
    });
    expect(res.statusCode).toBe(400);
  });
  it("should say you can't have spaces in your password", async () => {
    const res = await request(app).post("/users/signup").send({
      type: "admin",
      email: "admin123@example.com",
      username: "admin123",
      name: "admin",
      password: "123 123",
      confPassword: "123 123",
      school: "ESMAD",
    });
    expect(res.statusCode).toBe(400);
  });
  it("should say your passwords don't match", async () => {
    const res = await request(app).post("/users/signup").send({
      type: "admin",
      email: "admin123@example.com",
      username: "admin123",
      name: "admin",
      password: "123",
      confPassword: "12445345",
      school: "ESMAD",
    });
    expect(res.statusCode).toBe(403);
  });
  it("should say email already in use", async () => {
    const res = await request(app).post("/users/signup").send({
      type: "admin",
      email: "user@example.com",
      username: "admin123",
      name: "admin",
      password: "123",
      confPassword: "123",
      school: "ESMAD",
    });
    expect(res.statusCode).toBe(409);
  });
  it("should say username already in use", async () => {
    const res = await request(app).post("/users/signup").send({
      type: "admin",
      email: "admin123@example.com",
      username: "admin",
      name: "admin",
      password: "123",
      confPassword: "123",
      school: "ESMAD",
    });
    expect(res.statusCode).toBe(409);
  });
});

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
    let decoded = jwt.verify(tokenAdmin, config.SECRET);
    admin = { id: decoded.id, type: decoded.type };
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
  it("should ask for username and password", async () => {
    const res = await request(app).post("/users/login").send({
      username: "",
      password: "",
    });
    expect(res.statusCode).toBe(400);
  });
  it("should say user not found", async () => {
    const res = await request(app).post("/users/login").send({
      username: "user1",
      password: "123",
    });
    expect(res.statusCode).toBe(404);
  });
  it("should say invalid credentials", async () => {
    const res = await request(app).post("/users/login").send({
      username: "user",
      password: "1234",
    });
    expect(res.statusCode).toBe(401);
  });
  it("should say validation error??", async () => {
    const res = await request(app).post("/users/login").send({
      username: "user",
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /users", () => {
  it("should get all users type user", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`); // * auth token
    expect(res.statusCode).toBe(200);
  });
  it("should get all users", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
  });
  it("should say you don't have access", async () => {
    console.log(jwt.verify(tokenSecurity, config.SECRET));
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${tokenSecurity}`);
    expect(res.statusCode).toBe(403);
  });
});

describe("PATCH /users/council", () => {
  it("user should subscribe council", async () => {
    const res = await request(app)
      .patch("/users/council")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
  it("should say it requires user role", async () => {
    const res = await request(app)
      .patch("/users/council")
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(403);
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
  it("should say it requires admin role", async () => {
    const res = await request(app)
      .post("/users/createAdmin")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "security",
        email: "security123@example.com",
        username: "security123",
        password: "123",
        name: "security",
        confPassword: "123",
      });
    expect(res.statusCode).toBe(403);
  });
  it("should say you can only create admin and security", async () => {
    const res = await request(app)
      .post("/users/createAdmin")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        type: "user",
        email: "security123@example.com",
        username: "security123",
        password: "123",
        name: "security",
        confPassword: "123",
      });
    expect(res.statusCode).toBe(400);
  });
  it("should say to provide field", async () => {
    const res = await request(app)
      .post("/users/createAdmin")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        type: "security",
        email: "security123@example.com",
        username: "",
        password: "123",
        name: "security",
        confPassword: "123",
      });
    expect(res.statusCode).toBe(400);
  });
  it("should say username can't contain spaces", async () => {
    const res = await request(app)
      .post("/users/createAdmin")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        type: "security",
        email: "security123@example.com",
        username: "security 123",
        password: "123",
        name: "security",
        confPassword: "123",
      });
    expect(res.statusCode).toBe(400);
  });
  it("should say password can't contain spaces", async () => {
    const res = await request(app)
      .post("/users/createAdmin")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        type: "security",
        email: "security123@example.com",
        username: "security123",
        password: "123 123",
        name: "security",
        confPassword: "123",
      });
    expect(res.statusCode).toBe(400);
  });
  it("should say passwords don't match", async () => {
    const res = await request(app)
      .post("/users/createAdmin")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        type: "security",
        email: "security123@example.com",
        username: "security123",
        password: "123",
        name: "security",
        confPassword: "124",
      });
    expect(res.statusCode).toBe(403);
  });
  it("should say email already in use", async () => {
    const res = await request(app)
      .post("/users/createAdmin")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        type: "security",
        email: "security@example.com",
        username: "security123",
        password: "123",
        name: "security",
        confPassword: "123",
      });
    expect(res.statusCode).toBe(409);
  });
  it("should say username already in use", async () => {
    const res = await request(app)
      .post("/users/createAdmin")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        type: "security",
        email: "security123@example.com",
        username: "security",
        password: "123",
        name: "security",
        confPassword: "123",
      });
    expect(res.statusCode).toBe(409);
  });
});

describe("PATCH /users/dailyReward", () => {
  it("user should receive reward", async () => {
    const res = await request(app)
      .patch(`/users/dailyReward`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
  it("should say it requires user role", async () => {
    const res = await request(app)
      .patch(`/users/dailyReward`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(403);
  });
  it("should say it you already received reward", async () => {
    const res = await request(app)
      .patch(`/users/dailyReward`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });
});

describe("PATCH /users/adminEdit/:userID", () => {
  it("admin should edit password", async () => {
    const res = await request(app)
      .patch(`/users/adminEdit/${user.id}`) // * parâmetro userID
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        password: "1234",
        confPassword: "1234",
      });
    expect(res.statusCode).toBe(200);
  });
  it("should say it requires admin role", async () => {
    const res = await request(app)
      .patch(`/users/adminEdit/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        password: "1234",
        confPassword: "1234",
      });
    expect(res.statusCode).toBe(403);
  });
  it("should say password can't have spaces", async () => {
    const res = await request(app)
      .patch(`/users/adminEdit/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        password: "123 4",
        confPassword: "1234",
      });
    expect(res.statusCode).toBe(400);
  });
  it("should say passwords don't match", async () => {
    const res = await request(app)
      .patch(`/users/adminEdit/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        password: "1234",
        confPassword: "1235",
      });
    expect(res.statusCode).toBe(403);
  });
  it("should say provide valid password??", async () => {
    const res = await request(app)
      .patch(`/users/adminEdit/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        password: " ",
        confPassword: "1234",
      });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /users/getLogged", () => {
  it("should get logged", async () => {
    const res = await request(app)
      .get(`/users/getLogged`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});

describe("PATCH /users/pointsAct/:userID", () => {
  it("should change activity points", async () => {
    const res = await request(app)
      .patch(`/users/pointsAct/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
  });
  it("should say user doesn't exist", async () => {
    const res = await request(app)
      .patch(`/users/pointsAct/648c4d490ded6b9a5cdc0735`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(404);
  });

  it("should say you need admin role", async () => {
    const res = await request(app)
      .patch(`/users/pointsAct/${user.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });
});

describe("PATCH /users/pointsOc/:userID", () => {
  it("should change occurrence points", async () => {
    const res = await request(app)
      .patch(`/users/pointsOc/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
  });
  it("should say user doesn't exist", async () => {
    const res = await request(app)
      .patch(`/users/pointsOc/648c4d490ded6b9a5cdc0735`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(404);
  });

  it("should say you need admin role", async () => {
    const res = await request(app)
      .patch(`/users/pointsOc/${user.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });
});

describe("PATCH /users/edit/:userID", () => {
  it("should edit user profile", async () => {
    const res = await request(app)
      .patch(`/users/edit/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "nome",
        photo: "link",
        password: "1234",
        confPassword: "1234",
      });
    expect(res.statusCode).toBe(200);
  });
  it("should say it requires user role", async () => {
    const res = await request(app)
      .patch(`/users/edit/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        username: "nome",
        photo: "link",
        password: "1234",
        confPassword: "1234",
      });
    expect(res.statusCode).toBe(403);
  });
  it("should say you can't edit this user", async () => {
    const res = await request(app)
      .patch(`/users/edit/${admin.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "nome",
        photo: "link",
        password: "1234",
        confPassword: "1234",
      });
    expect(res.statusCode).toBe(401);
  });
  it("should say username already in use", async () => {
    const res = await request(app)
      .patch(`/users/edit/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "admin",
        photo: "link",
        password: "1234",
        confPassword: "1234",
      });
    expect(res.statusCode).toBe(409);
  });
  it("should say username can't have spaces", async () => {
    const res = await request(app)
      .patch(`/users/edit/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "nome 123",
        photo: "link",
        password: "1234",
        confPassword: "1234",
      });
    expect(res.statusCode).toBe(400);
  });
  it("should say password can't have spaces", async () => {
    const res = await request(app)
      .patch(`/users/edit/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "ola123",
        photo: "link",
        password: "123 o",
        confPassword: "1234",
      });
    expect(res.statusCode).toBe(400);
  });
  it("should say passwords don't match", async () => {
    const res = await request(app)
      .patch(`/users/edit/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "ola123",
        photo: "link",
        password: "1234",
        confPassword: "1235",
      });
    expect(res.statusCode).toBe(403);
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
  it("should say it requires admin role", async () => {
    const res = await request(app)
      .patch(`/users/${user.id}`)
      .set("Authorization", `Bearer ${tokenSecurity}`)
      .send({
        state: "active",
      });
    expect(res.statusCode).toBe(403);
  });
  it("should say user doesn't exist", async () => {
    const res = await request(app)
      .patch(`/users/6475de91cc588cb4313222d0`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        state: "active",
      });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /users/:userID", () => {
  it("should delete user", async () => {
    const res = await request(app)
      .delete(`/users/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(204);
  });
  it("should say it requires admin role", async () => {
    const res = await request(app)
      .delete(`/users/${user.id}`)
      .set("Authorization", `Bearer ${tokenSecurity}`);
    expect(res.statusCode).toBe(403);
  });
  it("should say user doesn't exist", async () => {
    const res = await request(app)
      .delete(`/users/${user.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(404);
  });
});
