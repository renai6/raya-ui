import { requireAuth } from "@/guards/sirKupal";
import Dashboard from "@/pages/Dashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    requireAuth();
  },
  component: Dashboard,
});
