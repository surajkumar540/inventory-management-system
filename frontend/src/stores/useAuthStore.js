// stores/useAuthStore.js
import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("token");
let user = null;

if (token) {
  try {
    user = jwtDecode(token);
  } catch {
    localStorage.removeItem("token");
  }
}

const useAuthStore = create((set) => ({
  token,
  user,

  login: (data) => {
    localStorage.setItem("token", data.token);
    const decoded = jwtDecode(data.token);
    set({ token: data.token, user: decoded });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
}));

export default useAuthStore;