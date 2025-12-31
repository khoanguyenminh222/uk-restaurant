"use client"

import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("uk-restaurant-theme")
    
    // Check system preference if no saved theme
    if (!savedTheme) {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const initialTheme = systemPrefersDark ? "dark" : "light"
      setTheme(initialTheme)
      // Apply theme immediately to prevent flash
      applyTheme(initialTheme)
    } else {
      setTheme(savedTheme)
      // Apply theme immediately to prevent flash
      applyTheme(savedTheme)
    }
    
    setMounted(true)
  }, [])

  const applyTheme = (newTheme) => {
    const root = document.documentElement
    // Remove both classes first to ensure clean state
    root.classList.remove("dark", "light")
    // Add the appropriate class
    if (newTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.add("light")
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("uk-restaurant-theme", newTheme)
    applyTheme(newTheme)
  }

  // Sync theme across tabs
  useEffect(() => {
    if (!mounted) return

    const handleStorageChange = (e) => {
      if (e.key === "uk-restaurant-theme") {
        const newTheme = e.newValue || "light"
        setTheme(newTheme)
        applyTheme(newTheme)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [mounted])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
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

