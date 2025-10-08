import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/guards/sirKupal";
import Sales from "@/pages/Sales";

export const Route = createFileRoute("/sales")({
  beforeLoad: () => {
    requireAuth();
  },
  component: Sales,
});
