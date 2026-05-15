import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import { createAuditLog } from "../utils/auditLogger.js";

const HIERARCHY = { SUPER_ADMIN: 4, ADMIN: 3, BRANCH_ADMIN: 2, STAFF: 1 };

const ROLE_HIERARCHY = {
  SUPER_ADMIN:  ["ADMIN", "BRANCH_ADMIN", "STAFF"],
  ADMIN:        ["BRANCH_ADMIN", "STAFF"],
  BRANCH_ADMIN: ["STAFF"],
};

export const getUsers = async (req, res) => {
  try {
    const { role, branchId } = req.query;
    const where = {};

    if (req.user.role === "SUPER_ADMIN") {
      if (role)     where.role     = role;
      if (branchId) where.branchId = Number(branchId);

    } else if (req.user.role === "ADMIN") {
      where.role = { in: ["BRANCH_ADMIN", "STAFF"] };
      if (branchId) where.branchId = Number(branchId);

    } else if (req.user.role === "BRANCH_ADMIN") {
      where.branchId = req.user.branchId;
      where.role = "STAFF";

    } else if (req.user.role === "STAFF") {
      // only own branch members, all roles in that branch
      where.branchId = req.user.branchId;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true,
        role: true, isVerified: true, createdAt: true,
        branch: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, branchId } = req.body;

    if (!name?.trim())     return res.status(400).json({ success: false, message: "Name is required" });
    if (!email?.trim())    return res.status(400).json({ success: false, message: "Email is required" });
    if (!password?.trim()) return res.status(400).json({ success: false, message: "Password is required" });
    if (!role)             return res.status(400).json({ success: false, message: "Role is required" });

    const allowed = ROLE_HIERARCHY[req.user.role] || [];
    if (!allowed.includes(role))
      return res.status(403).json({ success: false, message: `You cannot create a ${role} user` });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(409).json({ success: false, message: "Email already registered" });

    const assignedBranchId = req.user.role === "BRANCH_ADMIN"
      ? req.user.branchId
      : branchId ? Number(branchId) : null;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name, email,
        password: hashedPassword,
        role,
        branchId: assignedBranchId,
        isVerified: true,
      },
      select: { id: true, name: true, email: true, role: true, branchId: true },
    });

    await createAuditLog(req, "USER_CREATED", "User", user.id, { name, email, role });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, branchId, isVerified } = req.body;

    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
    if (!role)         return res.status(400).json({ success: false, message: "Role is required" });

    const target = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!target)
      return res.status(404).json({ success: false, message: "User not found" });

    if (req.user.role === "SUPER_ADMIN") {
      // can edit anyone except themselves via this check
    } else if (req.user.role === "ADMIN") {
      // can only edit BRANCH_ADMIN and STAFF
      if (!["BRANCH_ADMIN", "STAFF"].includes(target.role))
        return res.status(403).json({ success: false, message: "Cannot edit this user" });
    } else if (req.user.role === "BRANCH_ADMIN") {
      // can only edit STAFF in own branch
      if (target.role !== "STAFF" || target.branchId !== req.user.branchId)
        return res.status(403).json({ success: false, message: "Cannot edit this user" });
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(name       !== undefined && { name }),
        ...(role       !== undefined && { role }),
        ...(branchId   !== undefined && { branchId: branchId ? Number(branchId) : null }),
        ...(isVerified !== undefined && { isVerified }),
      },
      select: { id: true, name: true, email: true, role: true, branchId: true, isVerified: true },
    });

    await createAuditLog(req, "USER_UPDATED", "User", user.id, { role, branchId });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.id)
      return res.status(400).json({ success: false, message: "Cannot delete yourself" });

    const target = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!target)
      return res.status(404).json({ success: false, message: "User not found" });

    if (req.user.role === "SUPER_ADMIN") {
      // can delete anyone
    } else if (req.user.role === "ADMIN") {
      // can delete BRANCH_ADMIN and STAFF only
      if (!["BRANCH_ADMIN", "STAFF"].includes(target.role))
        return res.status(403).json({ success: false, message: "Cannot delete this user" });
    } else if (req.user.role === "BRANCH_ADMIN") {
      // can delete only own branch STAFF
      if (target.role !== "STAFF" || target.branchId !== req.user.branchId)
        return res.status(403).json({ success: false, message: "Cannot delete this user" });
    }

    await prisma.user.delete({ where: { id: Number(id) } });
    await createAuditLog(req, "USER_DELETED", "User", id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};