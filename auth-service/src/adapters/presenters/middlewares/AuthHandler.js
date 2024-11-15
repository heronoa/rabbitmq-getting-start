const jwt = require("jsonwebtoken");
const User = require("./models/User");

class AuthHandler {
  static async authorizeRole(requiredRole) {
    return async (req, res, next) => {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "Token não fornecido." });
      }

      try {
        // Verifica e decodifica o token
        const decoded = jwt.verify(token, "your_secret_key");

        // Verifica se o usuário ainda existe no banco de dados
        const user = await User.findById(decoded.sub);
        if (!user) {
          return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Verifica se o role do usuário no banco corresponde ao requerido
        if (user.role !== requiredRole) {
          return res.status(403).json({ error: "Acesso negado." });
        }

        // Armazena o usuário no request para uso posterior
        req.user = user;
        next(); // Permite o acesso à rota
      } catch (error) {
        return res.status(401).json({ error: "Token inválido." });
      }
    };
  }
}

module.exports = AuthHandler;
