import prisma from "../prisma/client.js";

export const getMyConversations = async (req, res) => {
  try {
    const myId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: myId }, { user2Id: myId }],
        messages: { some: {} },
      },
      include: {
        user1: { select: { id: true, name: true, role: true } },
        user2: { select: { id: true, name: true, role: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // filter deleted conversations in JS
    const filtered = conversations.filter((c) => {
      if (c.deletedBy && c.deletedBy.includes(myId)) return false;
      return true;
    });

    res.json({ success: true, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrCreateConversation = async (req, res) => {
  try {
    const myId    = req.user.id;
    const otherId = Number(req.params.userId);

    if (myId === otherId)
      return res.status(400).json({ success: false, message: "Cannot chat with yourself" });

    const user1Id = Math.min(myId, otherId);
    const user2Id = Math.max(myId, otherId);

    let conversation = await prisma.conversation.findUnique({
      where: { user1Id_user2Id: { user1Id, user2Id } },
      include: {
        user1: { select: { id: true, name: true, role: true } },
        user2: { select: { id: true, name: true, role: true } },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { user1Id, user2Id },
        include: {
          user1: { select: { id: true, name: true, role: true } },
          user2: { select: { id: true, name: true, role: true } },
        },
      });
    } else if (conversation.deletedBy.includes(myId)) {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { deletedBy: { set: conversation.deletedBy.filter((id) => id !== myId) } },
        include: {
          user1: { select: { id: true, name: true, role: true } },
          user2: { select: { id: true, name: true, role: true } },
        },
      });
    }

    res.json({ success: true, data: conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const myId           = req.user.id;
    const conversationId = Number(req.params.conversationId);

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation)
      return res.status(404).json({ success: false, message: "Not found" });

    if (conversation.user1Id !== myId && conversation.user2Id !== myId)
      return res.status(403).json({ success: false, message: "Access denied" });

    await prisma.message.updateMany({
      where: { conversationId, senderId: { not: myId }, read: false },
      data: { read: true },
    });

    // fetch all messages, filter in JS to avoid schema issues
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });

    // filter out deleted messages in JS
    const filtered = messages.filter((m) => {
      if (m.deletedForAll) return false;
      if (m.deletedBy && m.deletedBy.includes(myId)) return false;
      return true;
    });

    res.json({ success: true, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const myId           = req.user.id;
    const conversationId = Number(req.params.conversationId);

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation)
      return res.status(404).json({ success: false, message: "Not found" });

    if (conversation.user1Id !== myId && conversation.user2Id !== myId)
      return res.status(403).json({ success: false, message: "Access denied" });

    // always delete for me only
    const updatedDeletedBy = [...new Set([...conversation.deletedBy, myId])];
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { deletedBy: { set: updatedDeletedBy } },
    });

    res.json({ success: true, message: "Conversation deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteMessages = async (req, res) => {
  try {
    const myId = req.user.id;
    const { messageIds, deleteFor, conversationId } = req.body;

    if (!messageIds?.length)
      return res.status(400).json({ success: false, message: "No messages selected" });

    if (deleteFor === "everyone") {
      await prisma.message.updateMany({
        where: { id: { in: messageIds }, senderId: myId },
        data: { deletedForAll: true },
      });
    } else {
      const messages = await prisma.message.findMany({
        where: { id: { in: messageIds } },
        select: { id: true, deletedBy: true },
      });
      for (const msg of messages) {
        const updated = [...new Set([...(msg.deletedBy || []), myId])];
        await prisma.message.update({
          where: { id: msg.id },
          data: { deletedBy: { set: updated } },
        });
      }
    }

    res.json({ success: true, deleteFor, messageIds, conversationId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};