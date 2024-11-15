// tests/integration/userService.integration.test.ts
const request = require("supertest");

const { userMocks, adminMock } = require("./userMocks");
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
    await request(app).post("/public/register").send(adminMock).expect(201);
  });

  it("health check", async () => {
    await request(app).get("/").expect(200);
  });

  it("should list all users", async () => {
    await User.create(userMocks);

    const loginResponse = await request(app)
      .post("/public/login")
      .send({ email: adminMock.email, password: adminMock.password })
      .expect(200);

    const token = loginResponse.body.token;

    const response = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const cleanedResponse = response.body.map((user) => cleanUser(user));

    expect(cleanedResponse).toHaveLength([...userMocks, adminMock].length);
    expect(cleanedResponse).toEqual(
      expect.arrayContaining([
        expect.objectContaining(userMocks[0]),
        expect.objectContaining(userMocks[1]),
      ])
    );
  });

  it("should create an user successfully", async () => {
    const loginResponse = await request(app)
      .post("/public/login")
      .send({ email: adminMock.email, password: adminMock.password })
      .expect(200);

    const token = loginResponse.body.token;

    const response = await request(app)
      .post("/admin/users")
      .set("Authorization", `Bearer ${token}`)
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
    const loginResponse = await request(app)
      .post("/public/login")
      .send({ email: adminMock.email, password: adminMock.password })
      .expect(200);

    const token = loginResponse.body.token;

    const createdUser = await User.create(userMocks[0]);

    expect(createdUser).not.toBeNull();

    const updatingUser = createdUser.toObject();

    expect(cleanUser(updatingUser)).toEqual({ ...userMocks[0], role: "user" });

    const response = await request(app)
      .patch(`/admin/users/${updatingUser._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        role: "admin",
      });

    expect(response).not.toBeNull();

    const updatedUser = response.body;

    expect(updatedUser).toMatchObject({
      role: "admin",
    });

    const getUpdatedResponse = await request(app)
      .get(`/admin/users/${updatedUser._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const fetchUpdatedUser = getUpdatedResponse.body;

    expect(fetchUpdatedUser).toMatchObject({
      role: "admin",
      ...userMocks[0],
    });

    expect(fetchUpdatedUser).toEqual(updatedUser);
  });

  it("should delete an user successfully", async () => {
    await User.create(userMocks[0]);
    const loginResponse = await request(app)
      .post("/public/login")
      .send({ email: adminMock.email, password: adminMock.password })
      .expect(200);

    const token = loginResponse.body.token;

    const response = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    const firstNoAdminUser = response.body[1];

    expect(firstNoAdminUser).not.toBeNull();

    await request(app)
      .delete(`/admin/users/${firstNoAdminUser._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const deleteErrorResponse = await request(app)
      .get(`/admin/users/${firstNoAdminUser._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(500);

    const deletedUser = deleteErrorResponse.body;

    expect(deletedUser).toEqual({
      error: "Failed to fetch user",
    });
  });

  it("should fetch an user successfully", async () => {
    const createdUser = await User.create(userMocks[0]);

    expect(createdUser).not.toBeNull();

    const loginResponse = await request(app)
      .post("/public/login")
      .send({ email: adminMock.email, password: adminMock.password })
      .expect(200);

    const token = loginResponse.body.token;
    const response = await request(app)
      .get(`/admin/users/${createdUser._id}`)
      .set("Authorization", `Bearer ${token}`);

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
