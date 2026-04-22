// stores/useAuthStore.js
import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");
let user = null;

// Try to get user from localStorage first (has name, email, role)
if (storedUser) {
  try {
    user = JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("user");
  }
} else if (token) {
  // Fallback: decode JWT (only has id, role)
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
    // data = { token, user: { id, name, email, role } }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));

export default useAuthStore;