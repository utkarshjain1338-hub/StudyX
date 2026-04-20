import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "command-center";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({ 
  theme: "dark",
  setTheme: () => null
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem("scholar-theme") as Theme) || "dark"
  );

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem("scholar-theme", newTheme);
    setThemeState(newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-command-center");
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "command-center") {
      root.classList.add("dark", "theme-command-center");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
