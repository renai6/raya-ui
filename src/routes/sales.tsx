import { createFileRoute } from "@tanstack/react-router";
import { isCashier, requireAuth } from "@/guards/sirKupal";
import Sales from "@/pages/Sales";

export const Route = createFileRoute("/sales")({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Raya Sales",
      },
    ],
  }),
  beforeLoad: () => {
    requireAuth();
    isCashier();
  },
  component: Sales,
});
