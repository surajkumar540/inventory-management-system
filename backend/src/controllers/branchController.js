import prisma from "../prisma/client.js";
import { createAuditLog } from "../utils/auditLogger.js";

export const createBranch = async (req, res) => {
  try {
    const { name, city, address } = req.body;
    if (!name || !city)
      return res.status(400).json({ success: false, message: "Name and city required" });

    const branch = await prisma.branch.create({ data: { name, city, address } });
    await createAuditLog(req, "BRANCH_CREATED", "Branch", branch.id, { name });
    res.status(201).json({ success: true, data: branch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { users: true, products: true } } },
    });
    res.json({ success: true, data: branches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, address } = req.body;
    const branch = await prisma.branch.update({
      where: { id: Number(id) },
      data: { ...(name && { name }), ...(city && { city }), ...(address && { address }) },
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