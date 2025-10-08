import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import api from "@/lib/axios";
import { useAuthActions } from "@/stores/authStore";

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
    onSuccess: (data) => {
      login(data.user, data.access_token);
      navigate({ to: "/sales" });
    },
  });
};
