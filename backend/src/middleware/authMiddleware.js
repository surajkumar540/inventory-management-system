import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "No token" });

  const decoded = jwt.verify(token, "SECRET_KEY");

  req.user = decoded;

  next();
};