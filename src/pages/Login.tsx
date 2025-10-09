import { Login } from "@/components/login/Login";
import { useLogin } from "@/hooks/useLogin";
import { useAuthActions } from "@/stores/authStore";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const { mutate: login } = useLogin();
  const { restore } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    restore();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="flex flex-col items-center min-h-screen justify-center gap-3">
      <div className="text-center">
        <div className="text-6xl font-bold text-primary">NY</div>
        <div className="text-3xl font-bold">RAYA</div>
      </div>
      <Login
        handleSubmit={handleSubmit}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
      />
    </div>
  );
};

export default LoginPage;
