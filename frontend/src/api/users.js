import api from "./axios.js";

export const getUsers   = (params) => api.get("/users", { params });
export const createUser = (data)   => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id)     => api.delete(`/users/${id}`);