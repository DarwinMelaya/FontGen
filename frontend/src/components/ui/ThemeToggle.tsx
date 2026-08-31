import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted transition hover:border-border-strong hover:text-primary"
    >
      <span
        className={`relative flex h-6 w-11 items-center rounded-full border border-border bg-[var(--toggle-track)] transition-colors ${
          isDark ? "border-border-strong" : ""
        }`}
      >
        <span
          className={`absolute h-4 w-4 rounded-full bg-[var(--toggle-knob)] shadow transition-transform ${
            isDark ? "translate-x-[1.35rem]" : "translate-x-1"
          }`}
        />
      </span>
      <span className="text-primary">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
};

export default ThemeToggle;
