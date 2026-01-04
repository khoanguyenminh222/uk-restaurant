"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getStorageKey, STORAGE_KEYS } from "@/utils/storage"

const THEME_STORAGE_KEY = getStorageKey(STORAGE_KEYS.THEME)

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    
    // Default to light theme if no saved theme
    if (!savedTheme) {
      const initialTheme = "light"
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
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    applyTheme(newTheme)
  }

  // Sync theme across tabs
  useEffect(() => {
    if (!mounted) return

    const handleStorageChange = (e) => {
      if (e.key === THEME_STORAGE_KEY) {
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

