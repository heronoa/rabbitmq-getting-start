const createUser = require("../use-cases/CreateUser");
const getUser = require("../use-cases/GetUser");
const TokenGenerator = require("../use-cases/TokenGenerator");
const bcrypt = require("bcrypt");

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

    const token = await TokenGenerator.generate({ email });

    return token;
  } catch (error) {
    throw new Error("Error logging in: " + error);
  }
};

exports.register = async ({ name, email, password, username, role }) => {
  try {
    const newUser = await createUser.register({
      name,
      email,
      password,
      username,
      role,
    });

    return newUser;
  } catch (error) {
    throw new Error("Error registering user: " + error);
  }
};
