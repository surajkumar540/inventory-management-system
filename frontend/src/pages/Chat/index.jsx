import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getMyConversations, getOrCreateConversation,
  getMessages, deleteConversation, deleteMessages,
} from "../../api/chat";
import useAuthStore from "../../stores/useAuthStore";
import socket       from "../../socket";
import { MessageCircle, Send, Trash2, X, Check, ChevronDown } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const ROLE_COLORS = {
  SUPER_ADMIN:  "text-purple-500",
  ADMIN:        "text-blue-500",
  BRANCH_ADMIN: "text-amber-500",
  STAFF:        "text-gray-400",
};

function formatLastSeen(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  const now  = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60)    return "last seen just now";
  if (diff < 3600)  return `last seen ${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `last seen ${Math.floor(diff / 3600)}h ago`;
  return `last seen ${date.toLocaleDateString()}`;
}

export default function Chat() {
  const { user: me, token }             = useAuthStore();
  const qc                              = useQueryClient();
  const [activeConv, setActiveConv]     = useState(null);
  const [messages, setMessages]         = useState([]);
  const [text, setText]                 = useState("");
  const [onlineUsers, setOnlineUsers]   = useState([]);
  const [typingUsers, setTypingUsers]   = useState({});
  const [lastSeenMap, setLastSeenMap]   = useState({});
  const [selected, setSelected]         = useState([]);
  const [msgMenuId, setMsgMenuId]       = useState(null);
  const [searchParams]                  = useSearchParams();
  const bottomRef                       = useRef(null);
  const autoOpenDone                    = useRef(false);
  const typingTimeout                   = useRef(null);

  // ── socket setup ──
  useEffect(() => {
    socket.auth = { token };
    socket.connect();

    socket.on("onlineUsers",  (users) => setOnlineUsers(users));
    socket.on("newMessage",   (msg)   => {
      setMessages((p) => [...p, msg]);
      qc.invalidateQueries(["conversations"]);
    });
    socket.on("typing",       ({ userId, isTyping }) =>
      setTypingUsers((p) => ({ ...p, [userId]: isTyping }))
    );
    socket.on("lastSeen",     ({ userId, time }) =>
      setLastSeenMap((p) => ({ ...p, [userId]: time }))
    );
    socket.on("lastSeenMap",  (map) => setLastSeenMap(map));
    socket.on("messagesDeleted", ({ messageIds, deleteFor }) => {
      if (deleteFor === "everyone") {
        setMessages((prev) =>
          prev.map((m) =>
            messageIds.includes(m.id) ? { ...m, deletedForAll: true } : m
          )
        );
      }
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("newMessage");
      socket.off("typing");
      socket.off("lastSeen");
      socket.off("lastSeenMap");
      socket.off("messagesDeleted");
      socket.disconnect();
    };
  }, []);

  // ── scroll to bottom ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── close msg dropdown on outside click ──
  useEffect(() => {
    const handler = () => setMsgMenuId(null);
    if (msgMenuId) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [msgMenuId]);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn:  () => getMyConversations().then((r) => r.data.data),
  });

  // ── auto-open from ?userId= ──
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
      setSelected([]);
      setMsgMenuId(null);
      socket.emit("joinConversation", conv.id);
      const msgs = await getMessages(conv.id);
      setMessages(msgs.data.data);
    } catch (err) { console.error(err); }
  };

  const sendMessage = () => {
    if (!text.trim() || !activeConv) return;
    socket.emit("sendMessage", { conversationId: activeConv.id, content: text.trim() });
    socket.emit("typing", { conversationId: activeConv.id, isTyping: false });
    setText("");
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!activeConv) return;
    socket.emit("typing", { conversationId: activeConv.id, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing", { conversationId: activeConv.id, isTyping: false });
    }, 2000);
  };

  const deleteConvMutation = useMutation({
    mutationFn: (id) => deleteConversation(id),
    onSuccess:  () => {
      qc.invalidateQueries(["conversations"]);
      setActiveConv(null);
      setMessages([]);
    },
  });

  const deleteMsgMutation = useMutation({
    mutationFn: ({ messageIds, deleteFor }) =>
      deleteMessages(messageIds, deleteFor, activeConv.id),
    onSuccess: (_, { deleteFor, messageIds }) => {
      if (deleteFor === "everyone") {
        socket.emit("deleteMessages", {
          conversationId: activeConv.id,
          messageIds,
          deleteFor: "everyone",
        });
        setMessages((prev) =>
          prev.map((m) =>
            messageIds.includes(m.id) ? { ...m, deletedForAll: true } : m
          )
        );
      } else {
        setMessages((prev) => prev.filter((m) => !messageIds.includes(m.id)));
      }
      setSelected([]);
      qc.invalidateQueries(["conversations"]);
    },
  });

  const deleteSingleMsg = async (msgId, deleteFor) => {
    try {
      await deleteMessages([msgId], deleteFor, activeConv.id);
      if (deleteFor === "everyone") {
        socket.emit("deleteMessages", {
          conversationId: activeConv.id,
          messageIds: [msgId],
          deleteFor: "everyone",
        });
        setMessages((prev) =>
          prev.map((m) => m.id === msgId ? { ...m, deletedForAll: true } : m)
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
      }
      qc.invalidateQueries(["conversations"]);
    } catch (err) {
      console.error(err);
    }
    setMsgMenuId(null);
  };

  const toggleSelect = (msgId) =>
    setSelected((prev) =>
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
    );

  const canDeleteForEveryone = selected.length > 0 && selected.every((id) =>
    messages.find((m) => m.id === id)?.senderId === me.id
  );

  const getOtherUser = (conv) => conv.user1.id === me.id ? conv.user2 : conv.user1;
  const lastMessage  = (conv) => conv.messages?.[0]?.content || "";

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">

      {/* ── LEFT ── */}
      <div className="w-[280px] border-r border-gray-100 flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <MessageCircle size={16} className="text-blue-500" /> Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="text-xs text-gray-400 p-4">Loading...</p>
          ) : !conversations?.length ? (
            <p className="text-xs text-gray-400 p-4">
              No conversations yet.<br />Click a user's chat icon to start.
            </p>
          ) : conversations.map((conv) => {
            const other    = getOtherUser(conv);
            const isOnline = onlineUsers.includes(other.id);
            const isActive = activeConv?.id === conv.id;
            const isTyping = typingUsers[other.id];
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
                  <p className="text-xs text-gray-400 truncate">
                    {isTyping
                      ? <span className="text-emerald-500 italic">typing...</span>
                      : lastMessage(conv)
                    }
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT ── */}
      {activeConv ? (
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* header */}
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 min-h-[60px] shrink-0">
            {selected.length > 0 ? (
              <>
                <button
                  onClick={() => setSelected([])}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
                <p className="flex-1 text-sm font-medium text-gray-700">
                  {selected.length} selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteMsgMutation.mutate({ messageIds: selected, deleteFor: "me" })}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Delete for me
                  </button>
                  {canDeleteForEveryone && (
                    <button
                      onClick={() => deleteMsgMutation.mutate({ messageIds: selected, deleteFor: "everyone" })}
                      className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete for everyone
                    </button>
                  )}
                </div>
              </>
            ) : (() => {
              const other    = getOtherUser(activeConv);
              const isOnline = onlineUsers.includes(other.id);
              const isTyping = typingUsers[other.id];
              const lsText   = !isOnline ? formatLastSeen(lastSeenMap[other.id]) : null;
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
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{other.name}</p>
                    <p className="text-xs">
                      {isTyping ? (
                        <span className="text-emerald-500 italic">typing...</span>
                      ) : isOnline ? (
                        <span className="text-emerald-500">● Online</span>
                      ) : lsText ? (
                        <span className="text-gray-400">{lsText}</span>
                      ) : (
                        <span className={`font-medium ${ROLE_COLORS[other.role]}`}>
                          {other.role?.replace(/_/g, " ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteConvMutation.mutate(activeConv.id)}
                    className="p-2 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
                    title="Delete conversation"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              );
            })()}
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-gray-300">No messages yet. Say hello!</p>
              </div>
            ) : messages.map((msg) => {
              const isMine     = msg.senderId === me.id;
              const isSelected = selected.includes(msg.id);
              const isDeleted  = msg.deletedForAll;

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 my-0.5 ${isMine ? "justify-end" : "justify-start"}`}
                >
                  {selected.length > 0 && (
                    <div
                      onClick={() => toggleSelect(msg.id)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors
                        ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}
                    >
                      {isSelected && <Check size={11} className="text-white" />}
                    </div>
                  )}

                  <div className="relative group max-w-[65%]">
                    <div
                      onClick={() => selected.length > 0 && toggleSelect(msg.id)}
                      className={`relative px-4 py-2 rounded-2xl text-sm
                        ${selected.length > 0 ? "cursor-pointer" : "cursor-default"}
                        ${isDeleted
                          ? "bg-gray-100 text-gray-400 italic"
                          : isMine
                            ? `bg-blue-600 text-white rounded-br-sm ${isSelected ? "ring-2 ring-offset-1 ring-blue-400" : ""}`
                            : `bg-gray-100 text-gray-800 rounded-bl-sm ${isSelected ? "ring-2 ring-offset-1 ring-blue-400" : ""}`
                        }`}
                    >
                      <p className="pr-5 break-words">
                        {isDeleted ? "This message was deleted" : msg.content}
                      </p>
                      <p className={`text-[10px] mt-1 ${isMine && !isDeleted ? "text-blue-200" : "text-gray-400"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>

                      {!isDeleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMsgMenuId((prev) => prev === msg.id ? null : msg.id);
                          }}
                          className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full
                            flex items-center justify-center
                            opacity-0 group-hover:opacity-100 transition-opacity
                            ${isMine
                              ? "bg-blue-500 hover:bg-blue-400"
                              : "bg-gray-200 hover:bg-gray-300"
                            }`}
                        >
                          <ChevronDown size={11} className={isMine ? "text-white" : "text-gray-600"} />
                        </button>
                      )}
                    </div>

                    {msgMenuId === msg.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute top-9 z-20 bg-white border border-gray-100 rounded-xl shadow-lg w-44 overflow-hidden
                          ${isMine ? "right-0" : "left-0"}`}
                      >
                        <button
                          onClick={() => { setSelected([msg.id]); setMsgMenuId(null); }}
                          className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Select message
                        </button>
                        <button
                          onClick={() => deleteSingleMsg(msg.id, "me")}
                          className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50"
                        >
                          Delete for me
                        </button>
                        {isMine && (
                          <button
                            onClick={() => deleteSingleMsg(msg.id, "everyone")}
                            className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50"
                          >
                            Delete for everyone
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <div className="px-5 py-4 border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
              <input
                value={text}
                onChange={handleTyping}
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
          <p className="text-xs text-gray-300">
            Click the chat icon next to any user in Settings
          </p>
        </div>
      )}
    </div>
  );
}