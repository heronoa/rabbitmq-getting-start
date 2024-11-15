const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const User = require("../entities/User");

dotenv.config();
class TokenGenerator {
  static async generate({ email }) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return { error: "User Not Found" };
      }

      const payload = {
        sub: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return { token };
    } catch (error) {
      console.error(error);
      return { error: "Error on token generator: " + error };
    }
  }
}

module.exports = TokenGenerator;
