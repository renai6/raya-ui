import { requireAuth, isAdmin } from "@/guards/sirKupal";
import Inventory from "@/pages/Inventory";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/inventory")({
  beforeLoad: () => {
    requireAuth();
    isAdmin();
  },
  component: Inventory,
});
