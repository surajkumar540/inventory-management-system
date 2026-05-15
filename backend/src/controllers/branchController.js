import prisma from "../prisma/client.js";
import { createAuditLog } from "../utils/auditLogger.js";

export const getBranches = async (req, res) => {
  try {
    const where = {};

    // BRANCH_ADMIN only sees their own branch
    if (req.user.role === "BRANCH_ADMIN") {
      where.id = req.user.branchId;
    }

    const branches = await prisma.branch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { users: true, products: true } } },
    });
    res.json({ success: true, data: branches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBranch = async (req, res) => {
  try {
    const { name, city, address } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
    if (!city?.trim()) return res.status(400).json({ success: false, message: "City is required" });

    const branch = await prisma.branch.create({ data: { name, city, address } });
    await createAuditLog(req, "BRANCH_CREATED", "Branch", branch.id, { name });
    res.status(201).json({ success: true, data: branch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, address } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
    if (!city?.trim()) return res.status(400).json({ success: false, message: "City is required" });

    const branch = await prisma.branch.update({
      where: { id: Number(id) },
      data: { name, city, ...(address !== undefined && { address }) },
    });
    res.json({ success: true, data: branch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.branch.delete({ where: { id: Number(id) } });
    await createAuditLog(req, "BRANCH_DELETED", "Branch", id);
    res.json({ success: true, message: "Branch deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};