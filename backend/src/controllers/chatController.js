import prisma from "../prisma/client.js";

export const getMyConversations = async (req, res) => {
  try {
    const myId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: myId }, { user2Id: myId }],
        messages: { some: {} },
        NOT: { deletedBy: { has: myId } }, // hide if I deleted it
      },
      include: {
        user1: { select: { id: true, name: true, role: true } },
        user2: { select: { id: true, name: true, role: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ success: true, data: conversations });
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
      // I had deleted it before — restore for me by removing my id from deletedBy
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
      return res.status(404).json({ success: false, message: "Conversation not found" });

    if (conversation.user1Id !== myId && conversation.user2Id !== myId)
      return res.status(403).json({ success: false, message: "Access denied" });

    await prisma.message.updateMany({
      where: { conversationId, senderId: { not: myId }, read: false },
      data: { read: true },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });

    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const myId           = req.user.id;
    const conversationId = Number(req.params.conversationId);
    const { deleteFor }  = req.query; // "me" or "everyone"

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation)
      return res.status(404).json({ success: false, message: "Not found" });

    if (conversation.user1Id !== myId && conversation.user2Id !== myId)
      return res.status(403).json({ success: false, message: "Access denied" });

    if (deleteFor === "everyone") {
      // hard delete — remove messages + conversation for both
      await prisma.message.deleteMany({ where: { conversationId } });
      await prisma.conversation.delete({ where: { id: conversationId } });
      return res.json({ success: true, message: "Conversation deleted for everyone" });
    }

    // delete for me only — add myId to deletedBy
    const updatedDeletedBy = [...new Set([...conversation.deletedBy, myId])];
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { deletedBy: { set: updatedDeletedBy } },
    });

    res.json({ success: true, message: "Conversation deleted for you" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};