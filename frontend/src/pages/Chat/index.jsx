import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient }    from "@tanstack/react-query";
import { getMyConversations, getOrCreateConversation, getMessages } from "../../api/chat";
import useAuthStore   from "../../stores/useAuthStore";
import socket         from "../../socket";
import { MessageCircle, Send } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const ROLE_COLORS = {
  SUPER_ADMIN:  "text-purple-500",
  ADMIN:        "text-blue-500",
  BRANCH_ADMIN: "text-amber-500",
  STAFF:        "text-gray-400",
};

export default function Chat() {
  const { user: me, token }           = useAuthStore();
  const qc                            = useQueryClient();
  const [activeConv, setActiveConv]   = useState(null);
  const [messages, setMessages]       = useState([]);
  const [text, setText]               = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchParams]                = useSearchParams();
  const bottomRef                     = useRef(null);
  const autoOpenDone                  = useRef(false);

  // connect socket
  useEffect(() => {
    socket.auth = { token };
    socket.connect();

    socket.on("onlineUsers", (users) => setOnlineUsers(users));
    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      qc.invalidateQueries(["conversations"]);
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("newMessage");
      socket.disconnect();
    };
  }, []);

  // scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getMyConversations().then((r) => r.data.data),
  });

  // auto-open from ?userId= param — runs once after conversations load
  useEffect(() => {
    if (autoOpenDone.current) return;
    const userId = searchParams.get("userId");
    if (userId) {
      autoOpenDone.current = true;
      openConversation(Number(userId));
    }
  }, [searchParams]);

  const openConversation = async (userId) => {
    try {
      const res  = await getOrCreateConversation(userId);
      const conv = res.data.data;
      setActiveConv(conv);
      socket.emit("joinConversation", conv.id);
      const msgs = await getMessages(conv.id);
      setMessages(msgs.data.data);
    } catch (err) {
      console.error("openConversation error:", err);
    }
  };

  const sendMessage = () => {
    if (!text.trim() || !activeConv) return;
    socket.emit("sendMessage", { conversationId: activeConv.id, content: text.trim() });
    setText("");
  };

  const getOtherUser = (conv) =>
    conv.user1.id === me.id ? conv.user2 : conv.user1;

  const lastMessage = (conv) =>
    conv.messages?.[0]?.content || "No messages yet";

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">

      {/* LEFT: conversation list */}
      <div className="w-[280px] border-r border-gray-100 flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <MessageCircle size={16} className="text-blue-500" />
            Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="text-xs text-gray-400 p-4">Loading...</p>
          ) : !conversations?.length ? (
            <p className="text-xs text-gray-400 p-4">
              No conversations yet.<br />
              Click a user's chat icon to start.
            </p>
          ) : (
            conversations.map((conv) => {
              const other    = getOtherUser(conv);
              const isOnline = onlineUsers.includes(other.id);
              const isActive = activeConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => openConversation(other.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                    ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                      {other.name?.charAt(0).toUpperCase()}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{other.name}</p>
                    <p className="text-xs text-gray-400 truncate">{lastMessage(conv)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: message area */}
      {activeConv ? (
        <div className="flex-1 flex flex-col">

          {/* header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            {(() => {
              const other    = getOtherUser(activeConv);
              const isOnline = onlineUsers.includes(other.id);
              return (
                <>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                      {other.name?.charAt(0).toUpperCase()}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{other.name}</p>
                    <p className={`text-xs font-medium ${ROLE_COLORS[other.role]}`}>
                      {other.role?.replace(/_/g, " ")}
                      <span className={`ml-2 ${isOnline ? "text-emerald-500" : "text-gray-300"}`}>
                        ● {isOnline ? "Online" : "Offline"}
                      </span>
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
            {messages.map((msg) => {
              const isMine = msg.senderId === me.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[65%] px-4 py-2 rounded-2xl text-sm
                    ${isMine
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? "text-blue-200" : "text-gray-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <div className="px-5 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
              />
              <button
                onClick={sendMessage}
                disabled={!text.trim()}
                className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 text-gray-400">
          <MessageCircle size={40} className="text-gray-200" />
          <p className="text-sm">Select a conversation or start a new one</p>
          <p className="text-xs text-gray-300">Click the chat icon next to any user in Settings</p>
        </div>
      )}
    </div>
  );
}