"use client"

import { useState, useEffect, useRef } from "react"
import { Utensils, Home, BookOpen, Phone, ShoppingCart, User, Menu as MenuIcon, X, LogOut, UserCircle, History, Shield } from "lucide-react"
import { getCartItemCount } from "@/utils/cart"
import { getUser, clearUser } from "@/utils/user"
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle"

export default function Header({ onCartClick, onLoginClick, onProfileClick, onOrderHistoryClick }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const userMenuRef = useRef(null)
  const userButtonRef = useRef(null)
  const dropdownRef = useRef(null)

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

  // Update cart count
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartItemCount())
    }

    updateCartCount()
    // Listen for cart changes
    window.addEventListener("storage", updateCartCount)
    window.addEventListener("cartUpdated", updateCartCount)

    return () => {
      window.removeEventListener("storage", updateCartCount)
      window.removeEventListener("cartUpdated", updateCartCount)
    }
  }, [])

  // Update user info
  useEffect(() => {
    const updateUser = () => {
      setUser(getUser())
    }

    updateUser()
    // Listen for user changes
    window.addEventListener("userUpdated", updateUser)

    return () => {
      window.removeEventListener("userUpdated", updateUser)
    }
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideButton = userButtonRef.current && userButtonRef.current.contains(event.target)
      const isClickInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target)
      
      if (!isClickInsideButton && !isClickInsideDropdown) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isUserMenuOpen])

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

  const handleLogout = () => {
    clearUser()
    setIsUserMenuOpen(false)
    // Optional: redirect or refresh
  }

  const menuItems = [
    { id: "home", label: "Trang chủ", icon: Home },
    { id: "menu", label: "Thực đơn", icon: Utensils },
    { id: "about", label: "Giới thiệu", icon: BookOpen },
    { id: "contact", label: "Liên hệ", icon: Phone },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-lg shadow-black/10" : "bg-transparent"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="flex items-center justify-between h-16 sm:h-20 overflow-visible">
          {/* Logo */}
          <button
            onClick={() => scrollToSection("home")}
            className="flex cursor-pointer items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold font-display text-primary hover:text-primary-light hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-lg px-2 py-1 shrink-0"
            aria-label="UK Restaurant - Về trang chủ"
          >
            <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
            <span className="text-primary whitespace-nowrap linear-to-r from-primary to-primary-light">
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
                  className={`px-4 py-2.5 rounded-lg font-medium cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background flex items-center gap-2 ${
                    activeSection === item.id
                      ? "text-primary bg-muted relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-linear-to-r after:from-primary after:to-primary-light"
                      : "text-foreground hover:text-primary hover:bg-muted"
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
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Theme Toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Cart Icon */}
            <button
              onClick={onCartClick}
              className="relative p-2 rounded-lg cursor-pointer text-foreground hover:text-primary hover:bg-muted hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background shrink-0"
              aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center bg-linear-to-r from-primary to-primary-light text-primary-foreground text-xs font-semibold rounded-full animate-pulse">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* User Menu or Login Button */}
            {user ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  ref={userButtonRef}
                  onClick={() => {
                    if (userButtonRef.current) {
                      const rect = userButtonRef.current.getBoundingClientRect()
                      setDropdownPosition({
                        top: rect.bottom + 8,
                        right: window.innerWidth - rect.right
                      })
                    }
                    setIsUserMenuOpen(!isUserMenuOpen)
                  }}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer text-foreground hover:text-primary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-lg"
                  aria-label="Menu người dùng"
                  aria-expanded={isUserMenuOpen}
                >
                  <UserCircle className="w-5 h-5 shrink-0" />
                  <span className="max-w-[100px] truncate text-sm">{user.name || user.phone}</span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div 
                    ref={dropdownRef}
                    className="fixed w-56 bg-card border border-border rounded-lg shadow-lg z-50"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      right: `${dropdownPosition.right}px`
                    }}
                  >
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-card-foreground">{user.name}</p>
                        {user.phone && (
                          <p className="text-xs text-muted-foreground">{user.phone}</p>
                        )}
                      </div>
                      
                      {onProfileClick && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            onProfileClick()
                          }}
                          className="w-full cursor-pointer flex items-center gap-3 px-4 py-2 text-sm text-card-foreground hover:text-primary hover:bg-muted transition-colors"
                        >
                          <UserCircle className="w-4 h-4" />
                          Thông tin tài khoản
                        </button>
                      )}
                      
                      {onOrderHistoryClick && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            onOrderHistoryClick()
                          }}
                          className="w-full cursor-pointer flex items-center gap-3 px-4 py-2 text-sm text-card-foreground hover:text-primary hover:bg-muted transition-colors"
                        >
                          <History className="w-4 h-4" />
                          Lịch sử đơn hàng
                        </button>
                      )}
                      
                      {/* Admin Panel Link - Only for admin/super_admin */}
                      {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <a
                          href="/admin/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full cursor-pointer flex items-center gap-3 px-4 py-2 text-sm text-info hover:text-info/80 hover:bg-muted transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </a>
                      )}
                      
                      <div className="border-t border-border mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full cursor-pointer flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:text-destructive/80 hover:bg-muted transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              onLoginClick && (
                <button
                  onClick={onLoginClick}
                  className="hidden md:flex items-center gap-2 px-3 py-2 cursor-pointer text-foreground hover:text-primary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-lg"
                  aria-label="Đăng nhập"
                >
                  <User className="w-5 h-5 shrink-0" />
                  <span className="text-sm">Đăng nhập</span>
                </button>
              )
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg cursor-pointer text-foreground hover:text-primary hover:bg-muted transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background shrink-0"
              aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer" /> : <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden cursor-pointer bg-card border-t border-border transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? "opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="py-4 space-y-2 cursor-pointer" aria-label="Mobile navigation">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
                  activeSection === item.id
                    ? "text-primary bg-muted"
                    : "text-foreground hover:text-primary hover:bg-muted"
                }`}
                aria-current={activeSection === item.id ? "page" : undefined}
              >
                <IconComponent className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
          
          {/* Mobile User Menu */}
          {user ? (
            <>
              {onProfileClick && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    onProfileClick()
                  }}
                  className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-foreground hover:text-primary hover:bg-muted transition-all duration-300"
                >
                  <UserCircle className="w-5 h-5" />
                  <span>Thông tin tài khoản</span>
                </button>
              )}
              {onOrderHistoryClick && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    onOrderHistoryClick()
                  }}
                  className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-foreground hover:text-primary hover:bg-muted transition-all duration-300"
                >
                  <History className="w-5 h-5" />
                  <span>Lịch sử đơn hàng</span>
                </button>
              )}
              
              {/* Admin Panel Link - Only for admin/super_admin */}
              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <a
                  href="/admin/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-info hover:text-info/80 hover:bg-muted transition-all duration-300"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin Panel</span>
                </a>
              )}
              
              <button
                onClick={() => {
                  handleLogout()
                  setIsMenuOpen(false)
                }}
                className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-destructive hover:text-destructive/80 hover:bg-muted transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <>
              {/* Theme Toggle in Mobile Menu */}
              <div className="px-4 py-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Giao diện</span>
                  <ThemeToggle />
                </div>
              </div>
              {onLoginClick && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    onLoginClick()
                  }}
                  className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-foreground hover:text-primary hover:bg-muted transition-all duration-300"
                >
                  <User className="w-5 h-5" />
                  <span>Đăng nhập</span>
                </button>
              )}
            </>
          )}
          </nav>
        </div>
      </div>
    </header>
  )
}
