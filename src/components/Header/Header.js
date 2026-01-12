"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Utensils, Home, BookOpen, Phone, ShoppingCart, User, Menu as MenuIcon, X, LogOut, UserCircle, History, Shield } from "lucide-react"
import * as lucideIcons from "lucide-react"
import { getCartItemCount } from "@/utils/cart"
import { getUser, clearUser } from "@/utils/user"
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle"
import { useLandingConfig } from "@/hooks/useLandingConfig"

export default function Header({ onCartClick, onLoginClick, onProfileClick, onOrderHistoryClick }) {
  const { config, loading } = useLandingConfig()
  const pathname = usePathname()
  const router = useRouter()
  const isHomePage = pathname === '/'

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

  // Get menu items from config or use defaults
  const configMenuItems = config?.header?.menu_items || []
  const defaultMenuItems = [
    { id: "home", label: "Trang chủ", icon: Home },
    { id: "menu", label: "Thực đơn", icon: Utensils },
    { id: "about", label: "Giới thiệu", icon: BookOpen },
    { id: "contact", label: "Liên hệ", icon: Phone },
  ]

  // Helper function to get icon from lucide-react
  const getIconComponent = (iconName, itemId) => {
    if (!iconName) {
      const iconMap = {
        home: Home,
        menu: Utensils,
        about: BookOpen,
        contact: Phone,
      }
      return iconMap[itemId] || Home
    }

    // Try to get icon from lucide-react
    const iconNamePascal = iconName.charAt(0).toUpperCase() + iconName.slice(1)
    if (lucideIcons[iconNamePascal]) {
      return lucideIcons[iconNamePascal]
    }

    // Fallback to default based on id
    const iconMap = {
      home: Home,
      menu: Utensils,
      about: BookOpen,
      contact: Phone,
    }
    return iconMap[itemId] || Home
  }

  // Map config menu items to component format, filter out hidden items
  const menuItems = configMenuItems.length > 0
    ? configMenuItems
      .filter(item => item.is_visible !== false) // Chỉ hiển thị items có is_visible !== false
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(item => ({
        id: item.id,
        label: item.label,
        icon: getIconComponent(item.icon, item.id)
      }))
    : defaultMenuItems

  // Set active section based on pathname
  useEffect(() => {
    if (pathname === '/about') {
      setActiveSection('about')
    } else if (pathname === '/contact') {
      setActiveSection('contact')
    } else if (isHomePage) {
      // Chỉ set active section khi ở trang chủ
      setActiveSection('home')
    }
  }, [pathname, isHomePage])

  useEffect(() => {
    // Nếu không ở trang chủ, không cần scroll detection
    if (!isHomePage) {
      return
    }

    let ticking = false
    const headerHeight = 80 // Chiều cao header + offset

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          setIsScrolled(currentScrollY > 20)

          // Nếu scroll lên đầu trang, active "home"
          if (currentScrollY < 50) {
            setActiveSection("home")
            ticking = false
            return
          }

          // Lấy danh sách sections từ menuItems
          const sectionIds = menuItems.map(item => item.id)

          // Tìm section nào đang ở gần nhất với header
          let activeSectionId = "home"
          let minDistance = Infinity

          sectionIds.forEach((sectionId) => {
            const element = document.getElementById(sectionId)
            if (element) {
              const rect = element.getBoundingClientRect()
              const elementTop = rect.top + window.scrollY
              const distance = Math.abs(elementTop - currentScrollY - headerHeight)

              // Nếu section đang trong viewport và gần header nhất
              if (rect.top <= headerHeight + 100 && rect.bottom >= headerHeight) {
                if (distance < minDistance) {
                  minDistance = distance
                  activeSectionId = sectionId
                }
              }
            }
          })

          // Nếu không tìm thấy section nào trong viewport, tìm section gần nhất phía trên
          if (minDistance === Infinity) {
            let closestSectionId = "home"
            let closestDistance = Infinity

            sectionIds.forEach((sectionId) => {
              const element = document.getElementById(sectionId)
              if (element) {
                const rect = element.getBoundingClientRect()
                const elementTop = rect.top + window.scrollY

                // Chỉ xét các section phía trên vị trí hiện tại
                if (elementTop < currentScrollY + headerHeight) {
                  const distance = currentScrollY + headerHeight - elementTop
                  if (distance < closestDistance) {
                    closestDistance = distance
                    closestSectionId = sectionId
                  }
                }
              }
            })

            activeSectionId = closestSectionId
          }

          setActiveSection(activeSectionId)
          ticking = false
        })
        ticking = true
      }
    }

    // Check initial active section
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [menuItems.length, isHomePage]) // Chỉ re-run khi số lượng menu items thay đổi hoặc trang thay đổi

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

  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-muted animate-pulse rounded-lg"></div>
              <div className="w-32 h-6 bg-muted animate-pulse rounded-lg"></div>
            </div>
            <div className="hidden 2xl:flex gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-20 h-4 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted animate-pulse rounded-full"></div>
              <div className="w-10 h-10 bg-muted animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  const restaurantName = config?.header?.restaurant_name || 'UK Restaurant'

  const scrollToSection = (sectionId) => {
    // Nếu là "about" hoặc "contact", mở trong tab mới
    if (sectionId === "about") {
      window.open("/about", "_blank")
      setIsMenuOpen(false)
      return
    }

    if (sectionId === "contact") {
      window.open("/contact", "_blank")
      setIsMenuOpen(false)
      return
    }

    // Nếu không ở trang chủ, điều hướng về trang chủ với hash
    if (!isHomePage) {
      router.push(`/#${sectionId}`)
      setIsMenuOpen(false)
      return
    }

    // Nếu ở trang chủ, scroll đến section
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

  const handleLogoClick = () => {
    if (isHomePage) {
      scrollToSection("home")
    } else {
      router.push("/")
    }
  }

  const handleLogout = () => {
    clearUser()
    setIsUserMenuOpen(false)

    // Xóa thêm admin data nếu có (trường hợp user vừa là user vừa là admin)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_data')
      localStorage.removeItem('admin_logged_in')
    }

    // Save logout message to show after reload
    localStorage.setItem('logout_success_message', 'Đăng xuất thành công!')
    // Reload page to update header
    window.location.reload()
  }


  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background ${isScrolled ? "bg-background/95 backdrop-blur-md shadow-lg shadow-black/10" : "bg-background"
        }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="flex items-center justify-between h-16 sm:h-20 overflow-visible">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex cursor-pointer items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold font-display text-primary hover:text-primary-light hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-lg px-2 py-1 shrink-0"
            aria-label={`${restaurantName} - Về trang chủ`}
          >
            {config?.header?.display_mode === 'logo' && config?.header?.logo_url ? (
              <>
                <img
                  src={config.header.logo_url}
                  alt={restaurantName}
                  className="h-10 sm:h-12 md:h-14 object-contain"
                  onError={(e) => {
                    // Fallback to name if logo fails to load
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.logo-fallback').style.display = 'flex';
                  }}
                />
                <div className="logo-fallback hidden items-center gap-2">
                  <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
                  <span className="text-primary whitespace-nowrap linear-to-r from-primary to-primary-light">
                    {restaurantName}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
                <span className="text-primary whitespace-nowrap linear-to-r from-primary to-primary-light">
                  {restaurantName}
                </span>
              </>
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden 2xl:flex items-center gap-1 cursor-pointer" aria-label="Điều hướng chính">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2.5 rounded-lg font-medium cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background flex items-center gap-2 ${activeSection === item.id
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
            <div className="hidden 2xl:block">
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
              <div className="relative hidden 2xl:block" ref={userMenuRef}>
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
                  <span className="max-w-24 truncate text-sm">{user.name || user.phone}</span>
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
                      {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
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
                  className="hidden 2xl:flex items-center gap-2 px-3 py-2 cursor-pointer text-foreground hover:text-primary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-lg"
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
              className="2xl:hidden p-2 rounded-lg cursor-pointer text-foreground hover:text-primary hover:bg-muted transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background shrink-0"
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
        className={`2xl:hidden cursor-pointer bg-card border-t border-border transition-all duration-300 ease-in-out ${isMenuOpen
          ? "opacity-100 max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-6rem)] sm:overflow-y-auto"
          : "max-h-0 opacity-0 overflow-hidden"
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${activeSection === item.id
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

            {/* Theme Toggle in Mobile Menu - Always visible */}
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Giao diện</span>
                <ThemeToggle />
              </div>
            </div>

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
                {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager') && (
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
              onLoginClick && (
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
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
