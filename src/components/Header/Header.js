"use client"

import { useState, useEffect } from "react"
import { Utensils, Home, BookOpen, Phone, ShoppingCart, User, Menu as MenuIcon, X } from "lucide-react"

export default function Header({ onCartClick, onLoginClick }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          setIsScrolled(currentScrollY > 20)

          // Update active section based on scroll position
          const sections = ["home", "menu", "about", "contact"]
          const current = sections.find((section) => {
            const element = document.getElementById(section)
            if (element) {
              const rect = element.getBoundingClientRect()
              return rect.top <= 100 && rect.bottom >= 100
            }
            return false
          })
          if (current) setActiveSection(current)

          lastScrollY = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
    setIsMenuOpen(false)
    setActiveSection(sectionId)
  }

  const menuItems = [
    { id: "home", label: "Trang chủ", icon: Home },
    { id: "menu", label: "Thực đơn", icon: Utensils },
    { id: "about", label: "Giới thiệu", icon: BookOpen },
    { id: "contact", label: "Liên hệ", icon: Phone },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-gray-950/95 backdrop-blur-md shadow-lg shadow-black/50" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => scrollToSection("home")}
            className="flex cursor-pointer items-center gap-2 text-2xl md:text-3xl font-bold font-display text-green-600 hover:text-green-500 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-lg px-2"
            aria-label="UK Restaurant - Về trang chủ"
          >
            <Utensils className="w-8 h-8 text-green-600" />
            <span className="bg-linear-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              UK Restaurant
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 cursor-pointer" aria-label="Điều hướng chính">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2.5 rounded-lg font-medium cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-950 flex items-center gap-2 ${
                    activeSection === item.id
                      ? "text-green-400 bg-green-950/30 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-linear-to-r after:from-green-500 after:to-green-400"
                      : "text-gray-300 hover:text-green-400 hover:bg-green-950/20"
                  }`}
                  aria-current={activeSection === item.id ? "page" : undefined}
                >
                  <IconComponent className="w-4 h-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Cart Icon & Login Button */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <button
              onClick={onCartClick}
              className="relative p-2 rounded-lg cursor-pointer text-gray-300 hover:text-green-400 hover:bg-green-950/30 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-950"
              aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-linear-to-r from-green-600 to-green-500 text-white text-xs font-semibold rounded-full animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Login Button (hidden on mobile) */}
            {onLoginClick && (
              <button
                onClick={onLoginClick}
                className="hidden md:flex items-center gap-2 px-4 py-2 cursor-pointer text-gray-300 hover:text-green-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-lg"
                aria-label="Đăng nhập"
              >
                <User className="w-5 h-5" />
                <span>Đăng nhập</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg cursor-pointer text-gray-200 hover:text-green-400 hover:bg-green-950/30 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-950"
              aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="w-6 h-6 cursor-pointer" /> : <MenuIcon className="w-6 h-6 cursor-pointer" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden cursor-pointer bg-gray-900 border-t border-gray-800 transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="px-4 py-4 space-y-2 cursor-pointer" aria-label="Mobile navigation">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  activeSection === item.id
                    ? "text-green-400 bg-green-950/30"
                    : "text-gray-300 hover:text-green-400 hover:bg-green-950/20"
                }`}
                aria-current={activeSection === item.id ? "page" : undefined}
              >
                <IconComponent className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
