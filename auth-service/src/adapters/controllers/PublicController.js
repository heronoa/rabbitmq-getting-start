// controllers/userController.js
const PublicService = require("../../domain/services/PublicServices");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const data = await PublicService.login({email, password});

    if (!data.token) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    res.status(200).json({
      ...data,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      error: "Failed to login user: " + error,
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, username, role } = req.body;
    const newUser = await PublicService.register({
      name,
      email,
      password,
      username,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      error: "Failed to register user: " + error,
    });
  }
};

