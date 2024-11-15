// use-cases/GetUser.js
const User = require("../entities/User");

class DeleteUser {
  static async execute(id) {
    if (!id) {
      throw new Error("Must provide an id");
    }

    const users = await User.findByIdAndDelete(id);

    return users;
  }
}

module.exports = DeleteUser;
