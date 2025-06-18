"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"
type ColorTheme = "default" | "blue" | "green" | "orange" | "red" | "sunset" | "ocean" | "forest" | "galaxy" | "aurora"

interface ThemeContextType {
  theme: Theme
  colorTheme: ColorTheme
  setTheme: (theme: Theme) => void
  setColorTheme: (colorTheme: ColorTheme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark")

  useEffect(() => {
    const root = window.document.documentElement

    // Handle theme
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setResolvedTheme(systemTheme)
      root.classList.toggle("dark", systemTheme === "dark")
    } else {
      setResolvedTheme(theme)
      root.classList.toggle("dark", theme === "dark")
    }

    // Handle color theme by updating CSS custom properties
    const colorValues = {
      default: {
        primary: "330 81% 60%",
        primaryForeground: "210 40% 98%",
        background: resolvedTheme === "dark" ? "222.2 84% 4.9%" : "0 0% 100%",
        chatBackground: "",
      },
      blue: {
        primary: "221.2 83.2% 53.3%",
        primaryForeground: "210 40% 98%",
        background: resolvedTheme === "dark" ? "222.2 84% 4.9%" : "0 0% 100%",
        chatBackground: "",
      },
      green: {
        primary: "142.1 76.2% 36.3%",
        primaryForeground: "210 40% 98%",
        background: resolvedTheme === "dark" ? "222.2 84% 4.9%" : "0 0% 100%",
        chatBackground: "",
      },
      orange: {
        primary: "24.6 95% 53.1%",
        primaryForeground: "210 40% 98%",
        background: resolvedTheme === "dark" ? "222.2 84% 4.9%" : "0 0% 100%",
        chatBackground: "",
      },
      red: {
        primary: "0 84.2% 60.2%",
        primaryForeground: "210 40% 98%",
        background: resolvedTheme === "dark" ? "222.2 84% 4.9%" : "0 0% 100%",
        chatBackground: "",
      },
      sunset: {
        primary: "14 100% 57%",
        primaryForeground: "210 40% 98%",
        background: resolvedTheme === "dark" ? "222.2 84% 4.9%" : "0 0% 100%",
        chatBackground: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      ocean: {
        primary: "199 89% 48%",
        primaryForeground: "210 40% 98%",
        background: resolvedTheme === "dark" ? "222.2 84% 4.9%" : "0 0% 100%",
        chatBackground: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      forest: {
        primary: "142.1 76.2% 36.3%",
        primaryForeground: "210 40% 98%",
        background: resolvedTheme === "dark" ? "222.2 84% 4.9%" : "0 0% 100%",
        chatBackground: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
      },
      galaxy: {
        primary: "271 81% 56%",
        primaryForeground: "210 40% 98%",
        background: resolvedTheme === "dark" ? "222.2 84% 4.9%" : "0 0% 100%",
        chatBackground: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      aurora: {
        primary: "158 64% 52%",
        primaryForeground: "210 40% 98%",
        background: resolvedTheme === "dark" ? "222.2 84% 4.9%" : "0 0% 100%",
        chatBackground: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
    }

    const colors = colorValues[colorTheme]
    root.style.setProperty("--primary", colors.primary)
    root.style.setProperty("--primary-foreground", colors.primaryForeground)
    root.style.setProperty("--ring", colors.primary)

    // Set chat background for special themes
    if (colors.chatBackground) {
      root.style.setProperty("--chat-background", colors.chatBackground)
    } else {
      root.style.removeProperty("--chat-background")
    }
  }, [theme, colorTheme, resolvedTheme])

  return (
    <ThemeContext.Provider value={{ theme, colorTheme, setTheme, setColorTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
