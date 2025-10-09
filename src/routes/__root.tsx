import { ModeToggle } from "@/components/mode-toggle";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import { useRouterState } from "@tanstack/react-router";
import { UserToggle } from "@/components/user-toggle";
import { useAuthUser } from "@/stores/authStore";

export const Route = createRootRoute({
  component: () => <RootComponent />,
});

function RootComponent() {
  const user = useAuthUser();
  const routerState = useRouterState();
  const currentPathname = routerState.location.pathname;

  return (
    <>
      {!currentPathname.includes("/print") ? (
        <>
          {user?.email && (
            <header className="flex items-center justify-between px-20 py-8 bg-background mb-2">
              {/* Left: Logo */}
              <div className="flex items-center gap-2 cursor-pointer">
                <h1 className="text-2xl font-bold">
                  <span className="text-amber-500">NY</span> Raya
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/sales" className="[&.active]:font-bold">
                  POS
                </Link>
                <Link to="/dashboard" className="[&.active]:font-bold">
                  Dashboard
                </Link>
                {user?.role === "ADMIN" && (
                  <Link to="/inventory" className="[&.active]:font-bold">
                    Inventory
                  </Link>
                )}

                <div className="flex items-center gap-2">
                  <ModeToggle />
                  <UserToggle />
                </div>
              </div>
            </header>
          )}

          <div className="min-h-screen px-20">
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
