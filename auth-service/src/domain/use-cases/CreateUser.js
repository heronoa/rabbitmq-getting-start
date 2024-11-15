// use-cases/CreateUser.js
const User = require("../entities/User");
const bcrypt = require("bcrypt");

class CreateUser {
  static async execute({ name, email, password, username }) {
    if (!name || !email || !password || !username) {
      throw new Error("Missing required fields");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    const savedUser = await newUser.save();

    return savedUser;
  }

  static async register({ name, email, password, role, username }) {
    if (!name || !email || !password || !username) {
      throw new Error("Missing required fields");
    }

    const newUser = { name, email, password, role, username };

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    newUser.password = hashedPassword;

    const createdUser = await this.execute(newUser);

    return createdUser;
  }
}

module.exports = CreateUser;
