import api from "./axios";

export const signupUser = (data) => api.post("/auth/register", data);
export const loginUser  = (data) => api.post("/auth/login", data);