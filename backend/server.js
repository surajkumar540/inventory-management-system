import "dotenv/config";
import express from "express";
import cors    from "cors";
import morgan  from "morgan";
import helmet  from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import authRoutes      from "./src/routes/authRoutes.js";
import productRoutes   from "./src/routes/productRoutes.js";
import orderRoutes     from "./src/routes/orderRoutes.js";
import stockRoutes     from "./src/routes/stockRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import analyticsRoutes from "./src/routes/analyticsRoutes.js";
import aiRoutes        from "./src/routes/aiRoutes.js";
import auditRoutes     from "./src/routes/auditRoutes.js";
import branchRoutes    from "./src/routes/branchRoutes.js";
import userRoutes      from "./src/routes/userRoutes.js";
import chatRoutes      from "./src/routes/chatRoutes.js";
import prisma          from "./src/prisma/client.js";

import { globalLimiter } from "./src/middleware/rateLimitMiddleware.js";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";
const app        = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const onlineUsers = new Map(); // userId -> socketId
const lastSeen    = new Map(); // userId -> ISO string

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Unauthorized"));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user.id;

  onlineUsers.set(userId, socket.id);
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));

  // send current lastSeen map to newly connected user
  socket.emit("lastSeenMap", Object.fromEntries(lastSeen));

  socket.on("joinConversation", (conversationId) => {
    socket.join(`conv_${conversationId}`);
  });

  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(`conv_${conversationId}`).emit("typing", { userId, isTyping });
  });

  socket.on("sendMessage", async ({ conversationId, content }) => {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation) return;
      if (conversation.user1Id !== userId && conversation.user2Id !== userId) return;

      const message = await prisma.message.create({
        data: { conversationId, senderId: userId, content },
        include: { sender: { select: { id: true, name: true } } },
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      io.to(`conv_${conversationId}`).emit("newMessage", message);
    } catch (err) {
      console.error("sendMessage error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    lastSeen.set(userId, new Date().toISOString());
    onlineUsers.delete(userId);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    io.emit("lastSeen", { userId, time: lastSeen.get(userId) });
  });
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(globalLimiter);

app.use("/api/auth",      authRoutes);
app.use("/api/products",  productRoutes);
app.use("/api/orders",    orderRoutes);
app.use("/api/stock",     stockRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai",        aiRoutes);
app.use("/api/audit",     auditRoutes);
app.use("/api/branches",  branchRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/chat",      chatRoutes);

app.get("/", (req, res) => res.send("Inventory API 🚀"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));