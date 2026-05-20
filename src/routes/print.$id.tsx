import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/guards/sirKupal";
import PrintSale from "@/pages/PrintSale";

export const Route = createFileRoute("/print/$id")({
  beforeLoad: () => {
    requireAuth();
  },
  component: PrintSale,
});
