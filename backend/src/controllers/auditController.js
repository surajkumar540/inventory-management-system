import prisma from "../prisma/client.js";

export const getAuditLogs = async (req, res) => {
  const { action, entity, userId, page = 1, limit = 50 } = req.query;

  const where = {
    ...(action && { action }),
    ...(entity && { entity }),
    ...(userId && { userId: parseInt(userId) }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
};