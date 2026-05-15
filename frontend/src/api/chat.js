import api from "./axios.js";

export const getMyConversations       = ()     => api.get("/chat");
export const getOrCreateConversation  = (userId) => api.get(`/chat/${userId}`);
export const getMessages              = (conversationId) => api.get(`/chat/messages/${conversationId}`);