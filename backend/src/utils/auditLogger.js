import prisma from "../prisma/client.js";

/**
 * @param {object} req        - Express request (for userId, ip)
 * @param {string} action     - e.g. "PRODUCT_CREATED"
 * @param {string} entity     - e.g. "Product"
 * @param {string} entityId   - e.g. "42"
 * @param {object} metadata   - optional { before, after }
 */
export const createAuditLog = async (req, action, entity, entityId = null, metadata = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId:    req.user?.id    ?? null,
        userEmail: req.user?.email ?? null,
        action,
        entity,
        entityId:  entityId ? String(entityId) : null,
        metadata,
        ip: req.ip,
      },
    });
  } catch (err) {
    // Audit log fail hone se main request fail nahi honi chahiye
    console.error("[AuditLog Error]", err.message);
  }
};