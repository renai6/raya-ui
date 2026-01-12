import { requireAuth } from "@/guards/sirKupal";
import PrintCashCheckout from "@/pages/PrintCashCheckout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/print-cash-checkout/$id")({
  beforeLoad: () => {
    requireAuth();
  },
  component: PrintCashCheckout,
});
