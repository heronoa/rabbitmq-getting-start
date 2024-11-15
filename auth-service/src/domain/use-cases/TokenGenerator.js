const User = require("../entities/User");

class TokenGenerator {
  static async generate({ email }) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return { error: "Usuário não encontrado." };
      }

      const payload = {
        sub: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(payload, "your_secret_key", { expiresIn: "1h" });

      return { token };
    } catch (error) {
      console.error(error);
      return { error: "Erro ao gerar o token." };
    }
  }
}
