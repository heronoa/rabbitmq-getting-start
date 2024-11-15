const mongoose = require("mongoose");

const User = require("../../src/domain/entities/User");
const { userMocks } = require("../integration/userMocks");

beforeAll(async () => {
  await mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("Jest connected to mongodb");
    })
    .catch((error) => {
      console.log(`Jest couldn't connect to mongodb  ${error}`);
    });
  await User.deleteMany();
});

afterAll(async () => {
  await User.deleteMany();
  await mongoose.connection.close();
});

describe("MongoDB Integration Test - User Model", () => {
  it("should add a user and return it back with a id", async () => {
    const newUser = new User(userMocks[0]);

    await newUser.save();

    const users = await User.find();

    expect(users[0].id).toBeDefined();
  });
  it("should fetch a list of user with users, id", async () => {
    const users = await User.find();

    expect(Array.isArray(users)).toBe(true);

    const user = users[0];

    expect(user).toHaveProperty("id");
  });

  it("should delete a user", async () => {
    const users = await User.find();

    const firstUser = users[0];

    expect(firstUser).not.toBeNull();

    // Recupera o produto do banco de dados para confirmar a atualização
    await User.findByIdAndDelete(firstUser.id);
    const foundUser = await User.findById(firstUser.id);

    // Verifica se o preço foi atualizado corretamente
    expect(foundUser).toBeNull();
  });
});
