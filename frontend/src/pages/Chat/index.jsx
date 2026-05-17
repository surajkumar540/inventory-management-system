import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getMyConversations,
  getOrCreateConversation,
  getMessages,
  deleteConversation,
  deleteMessages,
} from "../../api/chat";
import useAuthStore from "../../stores/useAuthStore";
import socket from "../../socket";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  X,
  Check,
  ChevronDown,
  ArrowLeft,
  Trash2,
  MoreVertical,
  Search,
  Smile,
} from "lucide-react";

/* ─── helpers ─── */
const ROLE_COLORS = {
  SUPER_ADMIN:  "text-violet-500",
  ADMIN:        "text-blue-500",
  BRANCH_ADMIN: "text-amber-500",
  STAFF:        "text-slate-400",
};

const AVATAR_GRADIENTS = [
  "from-violet-400 to-purple-600",
  "from-blue-400 to-indigo-600",
  "from-teal-400 to-emerald-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-sky-600",
];

const avatarGradient = (name) =>
  AVATAR_GRADIENTS[(name?.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length];

const Avatar = ({ name, size = "md", online = false }) => {
  const initials = (name || "?").charAt(0).toUpperCase();
  const g = avatarGradient(name);
  const sz = size === "lg" ? "w-11 h-11 text-sm" : size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  const dot = size === "lg" ? "w-3 h-3 border-2" : "w-2.5 h-2.5 border-2";
  return (
    <div className="relative shrink-0">
      <div className={`${sz} rounded-2xl bg-gradient-to-br ${g} flex items-center justify-center text-white font-black shadow-sm`}>
        {initials}
      </div>
      {online && (
        <span className={`absolute -bottom-0.5 -right-0.5 ${dot} bg-emerald-400 rounded-full border-white`} />
      )}
    </div>
  );
};

function formatLastSeen(iso) {
  if (!iso) return null;
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function formatMsgTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = null;
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt).toDateString();
    if (d !== currentDate) {
      currentDate = d;
      groups.push({ type: "date", date: d, id: `date-${d}` });
    }
    groups.push({ type: "msg", ...msg });
  });
  return groups;
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

/* ─── Conversation Item ─── */
const ConvItem = ({ conv, isActive, other, isOnline, isTyping, lastMsg, onOpen, onDelete, menuOpen, onMenuToggle }) => (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    className={`relative flex items-center gap-3 px-3 py-3 mx-2 rounded-2xl cursor-pointer transition-all group
      ${isActive
        ? "bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100/80 shadow-sm"
        : "hover:bg-slate-50"
      }`}
  >
    <div className="flex items-center gap-3 flex-1 min-w-0" onClick={onOpen}>
      <Avatar name={other.name} online={isOnline} />
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-bold truncate ${isActive ? "text-indigo-700" : "text-slate-700"}`}>
          {other.name}
        </p>
        <p className="text-[11px] truncate mt-0.5">
          {isTyping
            ? <span className="text-emerald-500 font-semibold italic">typing…</span>
            : <span className="text-slate-400">{lastMsg || "No messages yet"}</span>
          }
        </p>
      </div>
    </div>

    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={(e) => { e.stopPropagation(); onMenuToggle(); }}
        className={`w-7 h-7 rounded-xl flex items-center justify-center text-slate-400
          transition-all ${menuOpen ? "opacity-100 bg-slate-100" : "opacity-0 group-hover:opacity-100 hover:bg-slate-100"}`}
      >
        <MoreVertical size={13} />
      </button>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-8 z-30 bg-white border border-slate-100 rounded-2xl shadow-xl w-48 overflow-hidden py-1"
          >
            <button
              onClick={onDelete}
              className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
              Delete conversation
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

/* ─── Main Chat ─── */
export default function Chat() {
  const { user: me, token } = useAuthStore();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [lastSeenMap, setLastSeenMap] = useState({});
  const [selected, setSelected] = useState([]);
  const [msgMenuId, setMsgMenuId] = useState(null);
  const [convMenuId, setConvMenuId] = useState(null);
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true); // mobile toggle

  const bottomRef = useRef(null);
  const autoOpenDone = useRef(false);
  const typingTimeout = useRef(null);
  const activeConvRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);

  /* ── socket ── */
  useEffect(() => {
    socket.auth = { token };
    socket.connect();
    socket.on("onlineUsers", setOnlineUsers);
    socket.on("newMessage", (msg) => {
      setMessages((p) => [...p, msg]);
      qc.invalidateQueries(["conversations"]);
    });
    socket.on("typing", ({ userId, isTyping }) =>
      setTypingUsers((p) => ({ ...p, [userId]: isTyping }))
    );
    socket.on("lastSeen", ({ userId, time }) =>
      setLastSeenMap((p) => ({ ...p, [userId]: time }))
    );
    socket.on("lastSeenMap", (map) => setLastSeenMap(map));
    socket.on("messagesDeleted", ({ messageIds, deleteFor }) => {
      if (deleteFor === "everyone")
        setMessages((prev) =>
          prev.map((m) => messageIds.includes(m.id) ? { ...m, deletedForAll: true } : m)
        );
    });
    socket.on("conversationDeleted", ({ conversationId }) => {
      if (activeConvRef.current?.id === conversationId) {
        setActiveConv(null);
        setMessages([]);
        navigate("/chat", { replace: true });
      }
      qc.invalidateQueries(["conversations"]);
    });
    return () => {
      ["onlineUsers","newMessage","typing","lastSeen","lastSeenMap","messagesDeleted","conversationDeleted"]
        .forEach((e) => socket.off(e));
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* close menus on outside click */
  useEffect(() => {
    if (!msgMenuId && !convMenuId) return;
    const h = () => { setMsgMenuId(null); setConvMenuId(null); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [msgMenuId, convMenuId]);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getMyConversations().then((r) => r.data.data),
  });

  /* auto-open from ?userId= */
  useEffect(() => {
    if (autoOpenDone.current) return;
    const userId = searchParams.get("userId");
    if (userId) { autoOpenDone.current = true; openConversation(Number(userId)); }
  }, [searchParams]);

  const openConversation = async (userId) => {
    try {
      const res = await getOrCreateConversation(userId);
      const conv = res.data.data;
      setActiveConv(conv);
      setSelected([]);
      setMsgMenuId(null);
      setConvMenuId(null);
      socket.emit("joinConversation", conv.id);
      const msgs = await getMessages(conv.id);
      setMessages(msgs.data.data);
      navigate(`/chat?userId=${userId}`, { replace: true });
      setShowSidebar(false); // mobile: hide sidebar when conv opens
      setTimeout(() => inputRef.current?.focus(), 100);
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
    onSuccess: (_, id) => {
      const conv = conversations?.find((c) => c.id === id);
      if (conv) {
        const other = getOtherUser(conv);
        socket.emit("conversationDeleted", { conversationId: id, otherUserId: other.id });
      }
      qc.invalidateQueries(["conversations"]);
      setActiveConv(null);
      setMessages([]);
      navigate("/chat", { replace: true });
      autoOpenDone.current = false;
      setShowSidebar(true);
    },
  });

  const deleteMsgMutation = useMutation({
    mutationFn: ({ messageIds, deleteFor }) =>
      deleteMessages(messageIds, deleteFor, activeConv.id),
    onSuccess: (_, { deleteFor, messageIds }) => {
      if (deleteFor === "everyone") {
        socket.emit("deleteMessages", { conversationId: activeConv.id, messageIds, deleteFor: "everyone" });
        setMessages((prev) =>
          prev.map((m) => messageIds.includes(m.id) ? { ...m, deletedForAll: true } : m)
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
        socket.emit("deleteMessages", { conversationId: activeConv.id, messageIds: [msgId], deleteFor: "everyone" });
        setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, deletedForAll: true } : m));
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
      }
      qc.invalidateQueries(["conversations"]);
    } catch (err) { console.error(err); }
    setMsgMenuId(null);
  };

  const toggleSelect = (msgId) =>
    setSelected((prev) => prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]);

  const canDeleteForEveryone = selected.length > 0 &&
    selected.every((id) => messages.find((m) => m.id === id)?.senderId === me.id);

  const getOtherUser = (conv) => conv.user1.id === me.id ? conv.user2 : conv.user1;

  const filteredConvs = (conversations || []).filter((conv) => {
    const other = getOtherUser(conv);
    return other.name?.toLowerCase().includes(search.toLowerCase());
  });

  const grouped = groupMessagesByDate(messages);

  /* ─── active conv data ─── */
  const activeOther = activeConv ? getOtherUser(activeConv) : null;
  const activeOnline = activeOther ? onlineUsers.includes(activeOther.id) : false;
  const activeTyping = activeOther ? typingUsers[activeOther.id] : false;
  const activeLsSeen = activeOther && !activeOnline ? formatLastSeen(lastSeenMap[activeOther.id]) : null;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm">

      {/* ══ SIDEBAR ══ */}
      <div className={`
        flex flex-col bg-white border-r border-slate-100
        w-full md:w-[300px] lg:w-[320px] shrink-0
        ${activeConv ? "hidden md:flex" : "flex"}
        ${showSidebar ? "flex" : "hidden md:flex"}
      `}>
        {/* Sidebar Header */}
        <div className="px-4 pt-5 pb-3 border-b border-slate-100/80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-black text-slate-800 tracking-tight">Messages</h2>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                {onlineUsers.filter((id) => id !== me?.id).length} online
              </span>
            </div>
          </div>
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-300 focus-within:bg-indigo-50/20 transition-all">
            <Search size={13} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="flex-1 bg-transparent text-[12.5px] font-medium text-slate-600 placeholder:text-slate-300 outline-none"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
          {isLoading ? (
            <div className="flex items-center justify-center h-24 gap-2">
              <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent animate-spin rounded-full" />
              <p className="text-[12px] text-slate-400 font-medium">Loading…</p>
            </div>
          ) : !filteredConvs.length ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                <MessageCircle size={18} className="text-slate-300" />
              </div>
              <p className="text-[13px] font-semibold text-slate-400">No conversations yet</p>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Click the chat icon next to a user in Settings to start
              </p>
            </div>
          ) : filteredConvs.map((conv) => {
            const other = getOtherUser(conv);
            return (
              <ConvItem
                key={conv.id}
                conv={conv}
                other={other}
                isActive={activeConv?.id === conv.id}
                isOnline={onlineUsers.includes(other.id)}
                isTyping={typingUsers[other.id]}
                lastMsg={conv.messages?.[0]?.content}
                onOpen={() => openConversation(other.id)}
                onDelete={() => { deleteConvMutation.mutate(conv.id); setConvMenuId(null); }}
                menuOpen={convMenuId === conv.id}
                onMenuToggle={() => setConvMenuId((p) => p === conv.id ? null : conv.id)}
              />
            );
          })}
        </div>
      </div>

      {/* ══ CHAT PANEL ══ */}
      {activeConv ? (
        <div className={`
          flex-1 flex flex-col overflow-hidden bg-white
          ${showSidebar ? "hidden md:flex" : "flex"}
        `}>

          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-white/95 backdrop-blur-sm shrink-0 min-h-[64px]">
            {selected.length > 0 ? (
              /* ── selection mode header ── */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 w-full"
              >
                <button
                  onClick={() => setSelected([])}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all"
                >
                  <X size={14} />
                </button>
                <p className="flex-1 text-[13px] font-bold text-slate-700">
                  {selected.length} selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteMsgMutation.mutate({ messageIds: selected, deleteFor: "me" })}
                    className="h-8 px-3 text-[11.5px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Delete for me
                  </button>
                  {canDeleteForEveryone && (
                    <button
                      onClick={() => deleteMsgMutation.mutate({ messageIds: selected, deleteFor: "everyone" })}
                      className="h-8 px-3 text-[11.5px] font-semibold text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all"
                    >
                      Delete for everyone
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              /* ── normal header ── */
              <>
                {/* Back button - mobile */}
                <button
                  onClick={() => { setShowSidebar(true); setActiveConv(null); }}
                  className="md:hidden w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all shrink-0"
                >
                  <ArrowLeft size={15} />
                </button>

                <Avatar name={activeOther?.name} size="lg" online={activeOnline} />

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-black text-slate-800 leading-tight truncate">
                    {activeOther?.name}
                  </p>
                  <p className="text-[11px] mt-0.5 leading-tight">
                    {activeTyping ? (
                      <span className="text-emerald-500 font-semibold italic flex items-center gap-1">
                        <span className="flex gap-0.5 items-center">
                          <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                        typing
                      </span>
                    ) : activeOnline ? (
                      <span className="text-emerald-500 font-semibold">● Online</span>
                    ) : activeLsSeen ? (
                      <span className="text-slate-400">last seen {activeLsSeen}</span>
                    ) : (
                      <span className={`font-semibold ${ROLE_COLORS[activeOther?.role]}`}>
                        {activeOther?.role?.replace(/_/g, " ")}
                      </span>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1"
            style={{
              backgroundImage: `radial-gradient(circle at 20px 20px, rgba(99,102,241,0.03) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
            onClick={() => { setMsgMenuId(null); setConvMenuId(null); }}
          >
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-100 flex items-center justify-center">
                  <MessageCircle size={24} className="text-indigo-400" />
                </div>
                <p className="text-[13px] font-semibold text-slate-400">No messages yet</p>
                <p className="text-[11px] text-slate-300">Say hello to {activeOther?.name}!</p>
              </div>
            ) : (
              grouped.map((item) => {
                if (item.type === "date") {
                  return (
                    <div key={item.id} className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-slate-100" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                        {formatDateLabel(item.date)}
                      </span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                  );
                }

                const msg = item;
                const isMine = msg.senderId === me.id;
                const isSelected = selected.includes(msg.id);
                const isDeleted = msg.deletedForAll;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-end gap-2 my-0.5 ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    {/* Select checkbox */}
                    {selected.length > 0 && (
                      <button
                        onClick={() => toggleSelect(msg.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                          ${isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300 bg-white hover:border-indigo-300"}`}
                      >
                        {isSelected && <Check size={10} className="text-white" />}
                      </button>
                    )}

                    {/* Bubble */}
                    <div className="relative group max-w-[70%] sm:max-w-[60%]">
                      <div
                        onClick={() => selected.length > 0 && toggleSelect(msg.id)}
                        className={`relative px-4 py-2.5 text-[13px] leading-relaxed transition-all
                          ${selected.length > 0 ? "cursor-pointer" : "cursor-default"}
                          ${isDeleted
                            ? "bg-slate-100 text-slate-400 italic rounded-2xl"
                            : isMine
                              ? `bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200/40
                                 rounded-2xl rounded-br-md ${isSelected ? "ring-2 ring-offset-2 ring-indigo-400" : ""}`
                              : `bg-white text-slate-700 border border-slate-100 shadow-sm
                                 rounded-2xl rounded-bl-md ${isSelected ? "ring-2 ring-offset-2 ring-indigo-300" : ""}`
                          }`}
                      >
                        <p className="break-words pr-1">{isDeleted ? "This message was deleted" : msg.content}</p>
                        <p className={`text-[10px] mt-1.5 text-right ${isMine && !isDeleted ? "text-indigo-200" : "text-slate-400"}`}>
                          {formatMsgTime(msg.createdAt)}
                        </p>

                        {/* chevron menu trigger */}
                        {!isDeleted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMsgMenuId((prev) => prev === msg.id ? null : msg.id);
                            }}
                            className={`absolute top-2 right-2 w-5 h-5 rounded-lg flex items-center justify-center
                              opacity-0 group-hover:opacity-100 transition-opacity
                              ${isMine ? "bg-white/20 hover:bg-white/30 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-500"}`}
                          >
                            <ChevronDown size={11} />
                          </button>
                        )}
                      </div>

                      {/* Message context menu */}
                      <AnimatePresence>
                        {msgMenuId === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                            transition={{ duration: 0.15 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute top-10 z-20 bg-white border border-slate-100 rounded-2xl shadow-xl w-48 overflow-hidden py-1
                              ${isMine ? "right-0" : "left-0"}`}
                          >
                            <button
                              onClick={() => { setSelected([msg.id]); setMsgMenuId(null); }}
                              className="w-full text-left px-4 py-2.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              Select message
                            </button>
                            <button
                              onClick={() => deleteSingleMsg(msg.id, "me")}
                              className="w-full text-left px-4 py-2.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors border-t border-slate-50"
                            >
                              Delete for me
                            </button>
                            {isMine && (
                              <button
                                onClick={() => deleteSingleMsg(msg.id, "everyone")}
                                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-colors border-t border-slate-50"
                              >
                                <Trash2 size={12} />
                                Delete for everyone
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <div className="px-4 py-3.5 border-t border-slate-100 bg-white shrink-0">
            <div className="flex items-end gap-2.5">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-indigo-300 focus-within:bg-indigo-50/20 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={handleTyping}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message…"
                  className="flex-1 bg-transparent text-[13px] font-medium text-slate-700 outline-none placeholder:text-slate-300 resize-none"
                />
              </div>
              <motion.button
                onClick={sendMessage}
                disabled={!text.trim()}
                whileTap={{ scale: 0.92 }}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-sm
                  ${text.trim()
                    ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-200/60 hover:shadow-indigo-300/60"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
              >
                <Send size={15} />
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Empty state (desktop) ── */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-4 bg-slate-50/60">
          <div className="w-20 h-20 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
            <MessageCircle size={32} className="text-slate-300" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-black text-slate-400">No conversation open</p>
            <p className="text-[12px] text-slate-300 mt-1">
              Select one from the list or start from a user's profile
            </p>
          </div>
        </div>
      )}
    </div>
  );
}