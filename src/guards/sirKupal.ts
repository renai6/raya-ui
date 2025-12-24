import { useAuthStore } from "@/stores/authStore";
import { redirect } from "@tanstack/react-router";

export const requireAuth = () => {
  const { token } = useAuthStore.getState();
  if (!token) throw redirect({ to: "/login" });
};

export const isAdmin = () => {
  const { token, user } = useAuthStore.getState();
  if (!token) throw redirect({ to: "/login" });
  if (user?.role !== "ADMIN") throw redirect({ to: "/sales" });
};
