const createUser = require("../use-cases/CreateUser");
const getUser = require("../use-cases/GetUser");
const deleteUser = require("../use-cases/DeleteUser");
const updateUser = require("../use-cases/UpdateUser");
const TokenGenerator = require("../use-cases/TokenGenerator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async ({ email, password }) => {
  try {
    const user = await getUser.byEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const token = TokenGenerator.generate({ email });

    return { token };
  } catch (error) {
    throw new Error("Error logging in");
  }
};

exports.register = async ({ name, email, password, username }) => {
  try {
    const newUser = await createUser.register({
      name,
      email,
      password,
      username,
    });

    return newUser;
  } catch (error) {
    throw new Error("Error registering user");
  }
};

exports.createUser = async ({ name, email, password, username }) => {
  try {
    const newUser = await createUser.execute({
      name,
      email,
      password,
      username,
    });

    return newUser;
  } catch (error) {
    throw new Error("Error creating user: " + error);
  }
};

exports.getUsers = async () => {
  try {
    return await getUser.all();
  } catch (error) {
    throw new Error("Error fetching users: " + error);
  }
};

exports.getUserById = async (userId) => {
  try {
    return await getUser.byId(userId);
  } catch (error) {
    throw new Error("Error fetching user");
  }
};

exports.updateUser = async (
  userId,
  { name, password, email, username, role }
) => {
  try {
    const user = await updateUser.one(userId, {
      name,
      password,
      email,
      username,
      role,
    });

    return user;
  } catch (error) {
    throw new Error("Error updating user: " + error);
  }
};

exports.deleteUser = async (userId) => {
  try {
    const user = await deleteUser.execute(userId);
    return user;
  } catch (error) {
    throw new Error("Error deleting user");
  }
};
