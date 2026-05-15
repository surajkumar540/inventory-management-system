import prisma from "../prisma/client.js";

// get or create conversation between two users
export const getOrCreateConversation = async (req, res) => {
  try {
    const myId     = req.user.id;
    const { userId } = req.params;
    const otherId  = Number(userId);

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
    }

    res.json({ success: true, data: conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// get all conversations for current user
export const getMyConversations = async (req, res) => {
  try {
    const myId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: myId }, { user2Id: myId }],
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

    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// get messages for a conversation
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

    // mark messages as read
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