// use-cases/CreateUser.js
const User = require("../entities/User");
const bcrypt = require("bcrypt");

class CreateUser {
  static async execute({ name, email, password, username, role }) {
    if (!name || !email || !password || !username) {
      throw new Error("Missing required fields");
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error("User with this email already exists");
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error("User with this username already exists");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
      role,
    });

    const savedUser = await newUser.save();

    return savedUser;
  }

  static async register({ name, email, password, username, role }) {
    if (!name || !email || !password || !username) {
      throw new Error("Missing required fields");
    }

    if (!["admin", "user"].includes(role)) {
      throw new Error("Invalid role");
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error("User with this email already exists");
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error("User with this username already exists");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role,
      username: username.trim(),
    });

    const savedUser = await newUser.save();

    return savedUser;
  }
}

module.exports = CreateUser;
