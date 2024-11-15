const UserService = require("../../domain/services/AdminServices");


exports.createUser = async (req, res) => {
  try {
    const { name, email, password, username, role } = req.body;
    const newUser = await UserService.createUser({
      name,
      email,
      password,
      username,
      role,
    });

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      error: "Failed to create user",
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await UserService.getUsers();

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      error: "Failed to fetch user",
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, password, username, role, email } = req.body;

    const updatedUser = await UserService.updateUser(userId, {
      name,
      password,
      username,
      role,
      email,
    });

    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      error: "Failed to update user: " + error,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await UserService.deleteUser(userId);

    if (!deletedUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      error: "Failed to delete user",
    });
  }
};
