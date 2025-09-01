"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "@/hooks/useSettings";

interface ThemeContextType {
  theme: "light" | "dark" | "system";
  resolvedTheme: "light" | "dark";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { settings, updateSetting, isLoading } = useSettings();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (isLoading) return;

    const applyTheme = () => {
      const root = document.documentElement;
      let themeToApply: "light" | "dark";

      if (settings.theme === "system") {
        themeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } else {
        themeToApply = settings.theme;
      }

      setResolvedTheme(themeToApply);

      // Apply theme to document
      if (themeToApply === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          "content",
          themeToApply === "dark" ? "#000000" : "#ffffff"
        );
      }
    };

    applyTheme();

    // Listen for system theme changes if using system theme
    if (settings.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme();

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    // Return a cleanup function for non-system themes
    return () => {};
  }, [settings.theme, isLoading]);

  const setTheme = (theme: "light" | "dark" | "system") => {
    updateSetting("theme", theme);
  };

  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: settings.theme,
        resolvedTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
