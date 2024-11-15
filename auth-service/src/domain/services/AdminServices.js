const createUser = require("../use-cases/CreateUser");
const getUser = require("../use-cases/GetUser");
const deleteUser = require("../use-cases/DeleteUser");
const updateUser = require("../use-cases/UpdateUser");

exports.createUser = async ({ name, email, password, username, role }) => {
  try {
    const newUser = await createUser.execute({
      name,
      email,
      password,
      username,
      role,
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
    throw new Error("Error fetching user: " + error);
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
    throw new Error("Error deleting user: " + error);
  }
};
