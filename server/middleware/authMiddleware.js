// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../utils/logger.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      logger.debug('Token verified for user: %s', req.user?.name);
      return next();
    } catch (error) {
      logger.warn({ err: error }, 'Token verification failed');

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }

      return res.status(401).json({ message: "Invalid token" });
    }
  }

  // If no token in header
  return res.status(401).json({ message: "Not authorized, no token" });
};

export { protect };
