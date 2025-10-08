import { User } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthActions, useAuthUser } from "@/stores/authStore";

export function UserToggle() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const { logout } = useAuthActions();

  const onLogout = () => {
    logout();
    navigate({ to: "/login" });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <User className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all  " />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onLogout}>
          Logout ({user?.email})
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
