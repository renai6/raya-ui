import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/guards/sirKupal";
import Print from "@/pages/Print";

export const Route = createFileRoute("/print/$id")({
  beforeLoad: () => {
    requireAuth();
  },
  component: Print,
});
