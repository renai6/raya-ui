import { create } from "zustand";

interface AuthState {
  user: any | null;
  token: string | null;
  actions: {
    login: (user: any, token: string) => void;
    logout: () => void;
    restore: () => void;
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  actions: {
    login: (user, token) => {
      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token });
    },
    logout: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      set({ user: null, token: null });
    },
    restore: () => {
      const token = localStorage.getItem("access_token");
      const user = localStorage.getItem("user");

      if (token && user) {
        set({ token, user: JSON.parse(user) });
      }
    },
  },
}));

export const useAuthActions = () => useAuthStore((state) => state.actions);
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useAuthUser = () => useAuthStore((state) => state.user);
