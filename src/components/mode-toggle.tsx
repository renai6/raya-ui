import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <>
      {theme === "light" ? (
        <div>
          <Sun
            onClick={() => setTheme("dark")}
            className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
          />
        </div>
      ) : (
        <div>
          <Moon
            onClick={() => setTheme("light")}
            className="h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
          />
        </div>
      )}
    </>
  );
}
