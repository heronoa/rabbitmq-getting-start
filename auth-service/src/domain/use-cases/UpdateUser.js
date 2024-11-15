const User = require("../entities/User");

class UpdateUser {
  static async one(id, { name, password, email, username, role }) {
    if (!id) {
      throw new Error("No id has been provided");
    }
    if (name && name.length <= 0) {
      throw new Error("Name must be at least 1 character long");
    }

    if (email && email.length <= 0) {
      throw new Error("Email must be at least 1 character long");
    }

    if (password && password.length <= 0) {
      throw new Error("Password must be at least 1 character long");
    }

    if (username && username.length <= 0) {
      throw new Error("Username must be at least 1 character long");
    }

    if (role && role.length <= 0) {
      throw new Error("Role must be at least 1 character");
    }

    const updatedUser = User.findByIdAndUpdate(
      id,
      { name, password, email, username, role },
      { new: true }
    );

    console.log({ updatedUser });

    return updatedUser;
  }
}

module.exports = UpdateUser;
