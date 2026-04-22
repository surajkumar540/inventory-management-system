// src/middleware/roleMiddleware.js

// Factory — pass one or more allowed roles
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const normalized = roles.map((r) => r.toUpperCase());
    if (!normalized.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${normalized.join(", ")}`,
      });
    }

    next();
  };

// Shortcuts for convenience
export const isAdmin = requireRole("ADMIN");
export const isManager = requireRole("ADMIN", "MANAGER");
export const isStaff = requireRole("ADMIN", "MANAGER", "STAFF");
