import LoginPage from "@/pages/Login";
import { useAuthStore } from "@/stores/authStore";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const checkToken = () => {
  const { token } = useAuthStore.getState();
  if (token) throw redirect({ to: "/sales" });
};

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    checkToken();
  },
  component: LoginPage,
});
