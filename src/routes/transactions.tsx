import { isAdmin, requireAuth } from "@/guards/sirKupal";
import Transactions from "@/pages/Transactions";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/transactions")({
  beforeLoad: () => {
    requireAuth();
    isAdmin();
  },
  component: Transactions,
});
