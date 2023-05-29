const mongoose = require("mongoose");
const User = require("../models/users.model"); // Replace 'User' with the actual model name

describe("Mongoose Database Tests", () => {
  beforeAll(async () => {
    // Connect to the test database
    await mongoose
      .connect(
        "mongodb+srv://beatriz:123@atlascluster.wdlmhli.mongodb.net/?retryWrites=true&w=majority",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      )
      .then(() => console.log("Database Connected Successfully"))

      .catch((err) => console.log(err));
  });

  afterAll(async () => {
    // Disconnect from the database~
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the test database before each test
    await User.deleteMany({});
  });

  test("should create a new document", async () => {
    const data = {
      name: "John",
      username: "user123",
      school: "ESMAD",
      email: "example@gmail.com",
      password: "123",
    };
    const createdDocument = await User.create(data);
    console.log(createdDocument);
    expect(createdDocument).toBeDefined();
    expect(createdDocument).toMatchObject(data);
  });

  test("should retrieve documents", async () => {
    // Insert test documents
    const testData = [
      {
        name: "John",
        username: "user123",
        school: "ESMAD",
        email: "example@gmail.com",
        password: "123",
        confPassword: "123",
      },
      // Add more test documents as needed
    ];
    await User.insertMany(testData);

    // Retrieve documents
    const documents = await User.find();

    expect(documents.length).toBe(testData.length);
  });

  // Add more test cases as needed
});
