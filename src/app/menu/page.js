"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header/Header"
import Footer from "@/components/Footer/Footer"
import { Search, X, ArrowLeft } from "lucide-react"
import MenuCard from "@/components/Menu/MenuCard"
import { addToCart } from "@/utils/cart"
import { formatCurrency } from "@/utils/helpers"
import Image from "next/image"
import { Utensils } from "lucide-react"

export default function MenuPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [foods, setFoods] = useState([])
  const [filteredFoods, setFilteredFoods] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [flyingItem, setFlyingItem] = useState(null)
  const [toast, setToast] = useState({ message: "", isVisible: false })
  const [isSticky, setIsSticky] = useState(false) // Sticky search và category bar
  const menuSectionRef = useRef(null)
  const stickyBarRef = useRef(null)
  const categoryTabsRef = useRef(null) // Ref cho category tabs gốc

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()
        if (data.success) {
          const sortedCategories = data.data.sort((a, b) => {
            const orderA = a.order || 999
            const orderB = b.order || 999
            return orderA - orderB
          })
          setCategories(sortedCategories)
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
      }
    }
    fetchCategories()
  }, [])

  // Filter foods
  const applyFilters = (foodsList, query) => {
    let filtered = foodsList
    if (query.trim()) {
      const lowerQuery = query.toLowerCase().trim()
      filtered = filtered.filter((food) => {
        const name = (food.name || "").toLowerCase()
        const description = (food.description || "").toLowerCase()
        return name.includes(lowerQuery) || description.includes(lowerQuery)
      })
    }
    setFilteredFoods(filtered)
  }

  // Fetch foods
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true)
        setIsTransitioning(true)
        await new Promise(resolve => setTimeout(resolve, 150))
        
        const url = selectedCategory
          ? `/api/food?category_id=${selectedCategory}`
          : "/api/food"
        const response = await fetch(url)
        const data = await response.json()
        if (data.success) {
          const availableFoods = data.data.filter((food) => food.is_available !== false)
          setFoods(availableFoods)
          applyFilters(availableFoods, searchQuery)
        } else {
          setError(data.error || "Lỗi khi tải món ăn")
        }
      } catch (err) {
        console.error("Error fetching foods:", err)
        setError("Lỗi khi tải món ăn")
      } finally {
        setTimeout(() => {
          setLoading(false)
          setIsTransitioning(false)
        }, 150)
      }
    }
    fetchFoods()
  }, [selectedCategory])

  useEffect(() => {
    if (foods.length > 0) {
      applyFilters(foods, searchQuery)
    }
  }, [searchQuery])

  // Sticky search và category bar khi scroll qua category tabs gốc
  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (menuSectionRef.current && categoryTabsRef.current) {
        const menuRect = menuSectionRef.current.getBoundingClientRect()
        const categoryTabsRect = categoryTabsRef.current.getBoundingClientRect()
        
        // Header height
        const headerHeight = window.innerWidth >= 768 ? 80 : 64
        const threshold = 150
        
        // Sticky khi:
        // 1. Category tabs gốc đã scroll qua khỏi viewport (bottom < headerHeight)
        // 2. Menu section vẫn còn trong viewport và chưa tới gần cuối (bottom > threshold + headerHeight)
        const shouldBeSticky = 
          categoryTabsRect.bottom < headerHeight && 
          menuRect.bottom > (threshold + headerHeight)
        
        setIsSticky(shouldBeSticky)
      }
      ticking = false
    }

    // Sử dụng requestAnimationFrame để scroll mượt hơn
    const optimizedHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll)
        ticking = true
      }
    }

    window.addEventListener('scroll', optimizedHandleScroll, { passive: true })
    handleScroll() // Check initial state
    return () => window.removeEventListener('scroll', optimizedHandleScroll)
  }, [])

  const handleCategoryClick = (categoryId) => {
    if (categoryId !== selectedCategory) {
      setSelectedCategory(categoryId)
    }
  }

  const handleAddToCart = ({ food, position }) => {
    setToast({
      message: `Đã thêm "${food.name}" vào giỏ hàng`,
      isVisible: true,
    })

    const cartIcon = document.querySelector('[aria-label*="Giỏ hàng"]')
    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect()
      const cartPosition = {
        x: cartRect.left + cartRect.width / 2,
        y: cartRect.top + cartRect.height / 2,
      }

      const deltaX = cartPosition.x - position.x
      const deltaY = cartPosition.y - position.y

      setFlyingItem({
        start: position,
        end: cartPosition,
        deltaX,
        deltaY,
        image: food.image,
        name: food.name,
      })

      setTimeout(() => setFlyingItem(null), 800)
    }

    addToCart({
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      category_id: food.category_id,
      quantity: 1,
    })

    window.dispatchEvent(new CustomEvent("cartUpdated"))
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20" ref={menuSectionRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Sticky Search and Category Bar - Chỉ hiện khi scroll */}
          <div
            ref={stickyBarRef}
            className={`fixed top-16 sm:top-20 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-md py-3 px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out ${
              isSticky 
                ? 'opacity-100 translate-y-0 pointer-events-auto' 
                : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
          >
            <div className="max-w-7xl mx-auto">
              {/* Search Bar */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-primary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm món ăn..."
                    className="w-full pl-12 pr-12 py-2.5 md:py-3 bg-card border-2 border-primary/30 rounded-xl text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary shadow-sm shadow-primary/10 transition-all text-sm md:text-base font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                      aria-label="Xóa tìm kiếm"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="mt-1.5 text-xs md:text-sm text-muted-foreground text-right">
                    Tìm thấy {filteredFoods.length} món{filteredFoods.length !== 1 ? "" : ""}
                  </p>
                )}
              </div>

              {/* Category Tabs */}
              <div className="relative">
                <div className="flex items-center px-2 gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide md:justify-center md:flex-wrap md:overflow-x-visible md:pb-0">
                  {/* Tab "Tất cả" */}
                  <button
                    onClick={() => handleCategoryClick(null)}
                    className={`shrink-0 px-3 md:px-6 py-1.5 md:py-2 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer text-sm md:text-base ${
                      selectedCategory === null
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/40 scale-105"
                        : "bg-card text-card-foreground hover:bg-primary/10 border border-border hover:scale-105 hover:border-primary/50"
                    }`}
                  >
                    Tất cả
                  </button>

                  {/* Category Tabs */}
                  {categories.length > 0 ? (
                    categories.map((category, index) => (
                      <button
                        key={category.id || category._id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`shrink-0 px-3 md:px-6 py-1.5 md:py-2 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background active:scale-95 category-tab cursor-pointer hover:scale-105 text-sm md:text-base ${
                          selectedCategory === category.id
                            ? "text-primary-foreground shadow-md shadow-primary/40 scale-105"
                            : "bg-card text-card-foreground border border-border"
                        }`}
                        style={{
                          ...(selectedCategory === category.id && category.color ? { 
                            backgroundColor: category.color,
                            borderColor: category.color 
                          } : {}),
                          ...(selectedCategory !== category.id && category.color ? { 
                            borderColor: category.color,
                            '--hover-color': category.color
                          } : {}),
                          animationDelay: `${index * 0.05}s`
                        }}
                        onMouseEnter={(e) => {
                          if (selectedCategory !== category.id && category.color) {
                            e.currentTarget.style.backgroundColor = `${category.color}20`
                            e.currentTarget.style.borderColor = category.color
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedCategory !== category.id) {
                            e.currentTarget.style.backgroundColor = ''
                            if (category.color) {
                              e.currentTarget.style.borderColor = category.color
                            } else {
                              e.currentTarget.style.borderColor = ''
                            }
                          }
                        }}
                      >
                        {category.icon && <span className="mr-2 inline-block animate-bounce-subtle">{category.icon}</span>}
                        {category.name}
                      </button>
                    ))
                  ) : (
                    <div className="text-muted-foreground text-sm">Đang tải danh mục...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors cursor-pointer hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại</span>
            </button>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-2">
              Thực đơn
            </h1>
            <p className="text-muted-foreground">
              Khám phá thực đơn đa dạng với các món ăn được chế biến từ nguyên liệu tươi ngon nhất
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm món ăn..."
                className="w-full pl-12 pr-12 py-3 bg-card border-2 border-primary/30 rounded-xl text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary shadow-lg shadow-primary/10 transition-all text-base font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-muted-foreground">
                Tìm thấy {filteredFoods.length} món
              </p>
            )}
          </div>

          {/* Category Tabs - Luôn hiển thị */}
          <div ref={categoryTabsRef} className="mb-8">
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`shrink-0 px-4 md:px-6 py-2 md:py-2.5 rounded-full font-medium transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer ${
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/40 scale-105"
                    : "bg-card text-card-foreground hover:bg-muted border border-border hover:scale-105"
                }`}
              >
                Tất cả
              </button>
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <button
                    key={category.id || category._id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`shrink-0 px-4 md:px-6 py-2 md:py-2.5 rounded-full font-medium transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background active:scale-95 cursor-pointer hover:scale-105 ${
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/40 scale-105"
                        : "bg-card text-card-foreground hover:bg-muted border border-border"
                    }`}
                    style={{
                      ...(category.color && selectedCategory === category.id ? { 
                        backgroundColor: category.color,
                        borderColor: category.color 
                      } : category.color ? { borderColor: category.color } : {}),
                    }}
                  >
                    {category.icon && <span className="mr-2">{category.icon}</span>}
                    {category.name}
                  </button>
                ))
              ) : (
                <div className="text-muted-foreground text-sm">Đang tải danh mục...</div>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Đang tải thực đơn...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null)
                    setSelectedCategory(null)
                    window.location.reload()
                  }}
                  className="px-6 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {/* Menu Grid - Compact Layout */}
          {!loading && !error && (
            <div className={`transition-all duration-300 ${
              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}>
              {filteredFoods.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                  {filteredFoods.map((food, index) => (
                    <div
                      key={food.id}
                      className="menu-item transform transition-all duration-500"
                      style={{
                        animationDelay: `${index * 0.05}s`
                      }}
                    >
                      <MenuCard food={food} onAddToCart={handleAddToCart} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <p className="text-muted-foreground text-lg mb-2">
                      {searchQuery
                        ? `Không tìm thấy món nào với từ khóa "${searchQuery}"`
                        : selectedCategory
                        ? "Không có món nào trong danh mục này"
                        : "Chưa có món ăn nào"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Toast */}
      {toast.isVisible && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg shadow-lg px-4 py-3 z-50 animate-fade-in">
          <p className="text-card-foreground">{toast.message}</p>
        </div>
      )}

      {/* Flying Item Animation */}
      {flyingItem && (
        <div
          className="fixed z-50 pointer-events-none flying-item"
          style={{
            left: `${flyingItem.start.x}px`,
            top: `${flyingItem.start.y}px`,
            transform: `translate(0, 0) scale(1)`,
            opacity: 1,
            animation: `flyToCart 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
            '--delta-x': `${flyingItem.deltaX}px`,
            '--delta-y': `${flyingItem.deltaY}px`,
          }}
        >
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white overflow-hidden">
            {flyingItem.image ? (
              <img
                src={flyingItem.image}
                alt={flyingItem.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-white text-xl">🍽️</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

