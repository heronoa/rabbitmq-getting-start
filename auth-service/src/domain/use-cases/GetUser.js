// use-cases/GetUser.js
const User = require("../entities/User");

class GetUser {
  static async all() {
    const users = await User.find();

    if (!users) {
      throw new Error("Users not found");
    }

    return users;
  }
  static async query(query) {
    const users = await User.find(query);

    if (!users) {
      throw new Error("Users not found");
    }

    return users;
  }

  static async byId(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

module.exports = GetUser;
