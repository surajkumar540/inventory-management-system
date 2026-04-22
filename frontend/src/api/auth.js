import api from "./axios";

export const signupUser      = (data) => api.post("/auth/register", data);
export const verifyOTP       = (data) => api.post("/auth/verify-otp", data);
export const loginUser       = (data) => api.post("/auth/login", data);
export const verifyLoginOTP  = (data) => api.post("/auth/verify-login-otp", data);
export const resendOTP       = (data) => api.post("/auth/resend-otp", data);