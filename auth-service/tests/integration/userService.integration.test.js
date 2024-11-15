// tests/integration/userService.integration.test.ts
const request = require("supertest");

const userMocks = require("./userMocks");
const app = require("../../src/index");
const User = require("../../src/domain/entities/User");
const Database = require("../../src/infrastructure/database");
const RabbitMQClient = require("../../src/infrastructure/messaging/RabbitMQClient");
const bcrypt = require("bcrypt");

const cleanUser = (user) => {
  const { _id, __v, createdAt, updatedAt, ...cleanedUser } = user;

  return cleanedUser;
};

describe("User Service - Integration Tests", () => {
  beforeAll(async () => {
    await Database.connect();
    await RabbitMQClient.connect(
      process.env.RABBITMQ_URL || "amqp://localhost"
    );
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Database.disconnect();
    await RabbitMQClient.close();
  });
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("health check", async () => {
    await request(app).get("/").expect(200);
  });

  it("should list all users", async () => {
    await User.create(userMocks);

    const response = await request(app).get("/users").expect(200);

    const cleanedResponse = response.body.map((user) => cleanUser(user));

    expect(cleanedResponse).toHaveLength(userMocks.length);
    expect(cleanedResponse).toEqual(
      expect.arrayContaining([
        expect.objectContaining(userMocks[0]),
        expect.objectContaining(userMocks[1]),
      ])
    );
  });

  it("should create an user successfully", async () => {
    const response = await request(app)
      .post("/users")
      .send(userMocks[1])
      .expect(201);

    const { password, ...expectedUser } = userMocks[1];

    expect(response.body).toMatchObject({
      message: "User created successfully",
      user: expectedUser,
    });

    const savedUser = await User.findById(response.body.user._id);
    expect(savedUser).not.toBeNull();
    expect(savedUser).toMatchObject(expectedUser);

    const isPasswordMatch = await bcrypt.compare(password, savedUser.password);
    expect(isPasswordMatch).toBe(true);
  });

  it("should update an user successfully", async () => {
    const createdUser = await User.create(userMocks[0]);

    expect(createdUser).not.toBeNull();

    const updatingUser = createdUser.toObject();

    expect(cleanUser(updatingUser)).toEqual({ ...userMocks[0], role: "user" });

    const response = await request(app)
      .patch(`/users/${updatingUser._id}`)
      .send({
        role: "admin",
      });

    expect(response).not.toBeNull();

    const updatedUser = response.body;

    expect(updatedUser).toMatchObject({
      role: "admin",
    });

    const getUpdatedResponse = await request(app).get(
      `/users/${updatedUser._id}`
    );

    const fetchUpdatedUser = getUpdatedResponse.body;

    expect(fetchUpdatedUser).toMatchObject({
      role: "admin",
      ...userMocks[0],
    });

    expect(fetchUpdatedUser).toEqual(updatedUser);
  });

  it("should delete an user successfully", async () => {
    await User.create(userMocks[0]);
    const response = await request(app).get("/users").expect(200);
    const firstUser = response.body[0];

    expect(firstUser).not.toBeNull();

    await request(app).delete(`/users/${firstUser._id}`);

    const deleteResponse = await request(app).get(`/users/${firstUser._id}`);

    const deletedUser = deleteResponse.body;

    expect(deletedUser).toEqual({
      error: "Failed to fetch user",
    });
  });

  it("should fetch an user successfully", async () => {
    const createdUser = await User.create(userMocks[0]);

    expect(createdUser).not.toBeNull();

    const response = await request(app).get(`/users/${createdUser._id}`);

    const fetchedUser = response.body;

    expect(fetchedUser).toMatchObject(userMocks[0]);
  });

  // it("should get admin token", async () => {
  //   const response = await request(app).post("/users/admin/token");

  //   const fetchedUser = response.body;

  //   expect(fetchedUser).toMatchObject({
  //     message: "Token sent successfully",
  //   });
  // });

  // it("should get user token", async () => {
  //   const response = await request(app).post("/users/user/token");

  //   const fetchedUser = response.body;

  //   expect(fetchedUser).toMatchObject({
  //     message: "Token sent successfully",
  //   });
  // });
});
