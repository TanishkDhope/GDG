import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="size-10" />; // Placeholder to avoid layout shift
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="cursor-pointer select-none">
      <div className="size-10 p-2 rounded-xl hover:bg-white/10 transition-colors">
        <div onClick={handleToggle} className="transition-all duration-300 ease-in-out flex items-center justify-center">
          {isDark ? <Sun className="text-yellow-400" /> : <Moon className="text-slate-700" />}
        </div>
      </div>
    </div>
  );
}
