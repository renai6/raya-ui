import { createFileRoute } from "@tanstack/react-router";
import { checkToken } from "./login";
import LoginPage from "@/pages/Login";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    checkToken();
  },
  component: LoginPage,
});
