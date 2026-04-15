export const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};