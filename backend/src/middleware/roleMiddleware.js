export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Not authenticated" });

    if (!roles.includes(req.user.role))
      return res.status(403).json({
        success: false,
        message: `Access denied. Required: ${roles.join(", ")}`,
      });

    next();
  };

export const isSuperAdmin  = requireRole("SUPER_ADMIN");
export const isAdmin       = requireRole("SUPER_ADMIN", "ADMIN");
export const isBranchAdmin = requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_ADMIN");
export const isStaff       = requireRole("SUPER_ADMIN", "ADMIN", "BRANCH_ADMIN", "STAFF");
export const isManager     = isAdmin;