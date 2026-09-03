import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useGame } from "@/game/store";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const markTheme = useGame((s) => s.markTheme);

  return (
    <button
      onClick={() => {
        toggleTheme();
        markTheme();
      }}
      className="relative flex h-9 w-9 items-center justify-center rounded-full
                 border border-border bg-card transition-colors hover:bg-muted"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {theme === "dark" ? (
          <Moon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Sun className="h-4 w-4 text-muted-foreground" />
        )}
      </motion.div>
    </button>
  );
}
