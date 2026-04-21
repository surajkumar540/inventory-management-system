import api from "./axios";

export const createOrder = (data) => api.post("/orders", data);
export const getOrders = () => api.get("/orders");
export const getMyOrders = () => api.get("/orders/my");
export const deleteOrder = (id) => api.delete(`/orders/${id}`);