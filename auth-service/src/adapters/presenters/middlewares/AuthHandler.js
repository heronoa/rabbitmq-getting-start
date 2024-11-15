const jwt = require("jsonwebtoken");

const GetUser = require("../../../domain/use-cases/GetUser");

class AuthHandler {
  static authorizeRole(requiredRole) {
    return async (req, res, next) => {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "Token Is Required" });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await GetUser.byId(decoded.sub);
        if (!user) {
          return res.status(404).json({ error: "User Not Found." });
        }

        if (user.role !== requiredRole) {
          return res.status(403).json({ error: "Acess Denied." });
        }

        req.user = user;
        next();
      } catch (error) {
        return res.status(401).json({ error: "Invalid Token." });
      }
    };
  }
}

module.exports = AuthHandler;
