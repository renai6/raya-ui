import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import api from "@/lib/axios";
import { useAuthActions } from "@/stores/authStore";
import { toast } from "sonner";

export const useLogin = () => {
  const { login } = useAuthActions();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const res = await api.post("/auth/login", { email, password });
      return res.data; // { access_token, user }
    },
    onError: () => {
      toast.error("Invalid email or password");
    },
    onSuccess: (data) => {
      login(data.user, data.access_token);
      navigate({ to: "/sales" });
    },
  });
};
