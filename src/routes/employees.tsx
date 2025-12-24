import { isAdmin, requireAuth } from "@/guards/sirKupal";
import Employees from "@/pages/Employees";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/employees")({
  beforeLoad: () => {
    requireAuth();
    isAdmin();
  },
  component: Employees,
});
