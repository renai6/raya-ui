import { ModeToggle } from "@/components/mode-toggle";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import { useRouterState } from "@tanstack/react-router";
import { UserToggle } from "@/components/user-toggle";
import { useAuthUser } from "@/stores/authStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import logo from "@/assets/raya_oflogo_s.png";

export const Route = createRootRoute({
  component: () => <RootComponent />,
});

function RootComponent() {
  const user = useAuthUser();
  const routerState = useRouterState();
  const currentPathname = routerState.location.pathname;

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <>
      {!currentPathname.includes("/print") ? (
        <>
          {!!user?.email && currentPathname !== "/" && (
            <header
              className={`${
                isDesktop ? "px-20" : "px-4"
              } flex items-center justify-between py-8 bg-background mb-2`}
            >
              {/* Left: Logo */}
              <div className="flex items-center cursor-pointer gap-3">
                <img
                  src={logo}
                  alt="Raya Logo"
                  className="h-12 w-12 object-contain mb-1"
                />
                <h2>Yusop Store</h2>
              </div>
              <div className="flex items-center gap-5">
                {!isDesktop ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MenuIcon className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all  " />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Link to="/sales" className="[&.active]:font-bold">
                          POS
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/dashboard" className="[&.active]:font-bold">
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      {user?.role === "ADMIN" && (
                        <>
                          <DropdownMenuItem>
                            <Link
                              to="/inventory"
                              className="[&.active]:font-bold"
                            >
                              Inventory
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Link
                      to="/sales"
                      className="[&.active]:font-bold hover:text-amber-500"
                    >
                      POS
                    </Link>
                    <Link
                      to="/dashboard"
                      className="[&.active]:font-bold hover:text-amber-500"
                    >
                      Dashboard
                    </Link>
                    {user?.role === "ADMIN" && (
                      <>
                        <Link
                          to="/inventory"
                          className="[&.active]:font-bold hover:text-amber-500"
                        >
                          Inventory
                        </Link>
                      </>
                    )}
                  </>
                )}

                <div className="flex items-center gap-2">
                  <ModeToggle />
                  <UserToggle />
                </div>
              </div>
            </header>
          )}

          <div className={`${isDesktop ? "px-20" : "px-4"}`}>
            <Outlet />

            <Toaster richColors position="top-center" duration={3000} />
          </div>
          <TanStackRouterDevtools />
        </>
      ) : (
        <div className="min-h-screen pt-4 px-1 bg-white text-black">
          <Outlet />
        </div>
      )}
    </>
  );
}
