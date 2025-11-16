// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  console.log('--- "protect" middleware initiated ---');
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      console.log("✔ Token verified, user:", req.user?.name);
      return next();
    } catch (error) {
      console.error("--- TOKEN VERIFICATION FAILED ---", error);

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
