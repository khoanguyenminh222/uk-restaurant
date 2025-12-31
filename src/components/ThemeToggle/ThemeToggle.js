"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme()

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        aria-label="Chuyển đổi theme"
      >
        <Sun className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-foreground hover:bg-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background hover:scale-110 active:scale-95"
      aria-label={theme === "light" ? "Chuyển sang dark mode" : "Chuyển sang light mode"}
      title={theme === "light" ? "Chuyển sang dark mode" : "Chuyển sang light mode"}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 transition-transform duration-300" />
      ) : (
        <Sun className="w-5 h-5 transition-transform duration-300" />
      )}
    </button>
  )
}

