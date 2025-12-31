"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import MenuCard from "./MenuCard"

export default function Menu({ onAddToCart, onOrderClick }) {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [foods, setFoods] = useState([])
  const [filteredFoods, setFilteredFoods] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null) // null = "Tất cả"
  const [searchQuery, setSearchQuery] = useState("") // Query tìm kiếm
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false) // Trạng thái đang chuyển category
  const [isSticky, setIsSticky] = useState(false) // Sticky search và category bar
  const menuSectionRef = useRef(null)
  const stickyBarRef = useRef(null)
  const categoryTabsRef = useRef(null) // Ref cho category tabs gốc

  const [headerRef, isHeaderVisible] = useScrollAnimation({ threshold: 0.2 })
  const [contentRef, isContentVisible] = useScrollAnimation({ threshold: 0.2 })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()
        if (data.success) {
          setCategories(data.data || [])
        } else {
          console.error("Error fetching categories:", data.error)
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
      }
    }

    fetchCategories()
  }, [])

  // Fetch foods
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setIsTransitioning(true)
        const response = await fetch("/api/food")
        const data = await response.json()
        if (data.success) {
          setFoods(data.data || [])
          applyFilters(data.data || [], searchQuery)
        } else {
          setError(data.error || "Không thể tải danh sách món ăn")
        }
      } catch (err) {
        console.error("Error fetching foods:", err)
        setError("Không thể tải danh sách món ăn")
      } finally {
        setLoading(false)
        setTimeout(() => {
          setIsTransitioning(false)
        }, 150)
      }
    }

    fetchFoods()
  }, [selectedCategory])

  // Apply filters when search query changes
  useEffect(() => {
    if (foods.length > 0) {
      applyFilters(foods, searchQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const applyFilters = (foodsList, query) => {
    let filtered = foodsList

    // Filter by category
    if (selectedCategory !== null) {
      filtered = filtered.filter((food) => food.category_id === selectedCategory)
    }

    // Filter by search query
    if (query.trim()) {
      const searchLower = query.toLowerCase().trim()
      filtered = filtered.filter(
        (food) =>
          food.name.toLowerCase().includes(searchLower) ||
          food.description?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredFoods(filtered)
  }

  const handleCategoryClick = (categoryId) => {
    if (categoryId !== selectedCategory) {
      setSelectedCategory(categoryId)
      // Clear search khi đổi category (optional - có thể bỏ nếu muốn giữ search)
      // setSearchQuery("")
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const handleViewAllMenu = () => {
    router.push('/menu')
  }

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
        // 1. Category tabs gốc đã scroll qua khỏi viewport (top < 0 hoặc bottom < headerHeight)
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

  return (
    <section id="menu" ref={menuSectionRef} className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-muted relative">
      <div className="max-w-7xl mx-auto overflow-hidden">
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
                    onChange={handleSearchChange}
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

        {/* Section Header - Luôn hiển thị */}
        <div
          ref={headerRef}
          className={`scroll-fade-in ${isHeaderVisible ? "visible" : ""} mb-6`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            {/* Section Header - Left Side */}
            <div className="shrink-0">
              <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-1">
                Thực đơn
              </h2>
              <div className="w-40 h-0.5 bg-primary rounded-full"></div>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Khám phá thực đơn đa dạng với các món ăn được chế biến từ nguyên liệu tươi ngon nhất
              </p>
            </div>

            {/* Search Bar - Right Side, Prominent */}
            <div
              ref={contentRef}
              className={`flex-1 max-w-2xl scroll-fade-in p-3 ${isContentVisible ? "visible" : ""}`}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-primary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Tìm kiếm món ăn..."
                  className="w-full pl-12 pr-12 py-3 md:py-4 bg-card border-2 border-primary/30 rounded-xl text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary shadow-sm shadow-primary/10 transition-all text-base md:text-lg font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-muted-foreground text-right">
                  Tìm thấy {filteredFoods.length} món{filteredFoods.length !== 1 ? "" : ""}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Category Tabs - Luôn hiển thị */}
        <div ref={categoryTabsRef} className="relative mb-6">
          <div className="max-w-7xl mx-auto py-3">
            <div className="flex items-center px-2 gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide md:justify-center md:flex-wrap md:overflow-x-visible md:pb-0">
              {/* Tab "Tất cả" - Luôn hiển thị */}
              <button
                onClick={() => handleCategoryClick(null)}
                className={`shrink-0 px-4 md:px-6 py-2 md:py-2.5 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer ${
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/40 scale-105"
                    : "bg-card text-card-foreground hover:bg-primary/10 border border-border hover:scale-105 hover:border-primary/50"
                }`}
              >
                Tất cả
              </button>

              {/* Category Tabs - Hiển thị tất cả categories */}
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <button
                    key={category.id || category._id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`shrink-0 px-4 md:px-6 py-2 md:py-2.5 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background active:scale-95 category-tab cursor-pointer hover:scale-105 ${
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground">Đang tải thực đơn...</p>
            </div>
          </div>
        )}

        {/* Error State */}
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
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Menu Grid - Preview trên landing page */}
        {!loading && !error && (
          <>
            {filteredFoods.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                {filteredFoods.slice(0, 12).map((food) => (
                  <MenuCard
                    key={food.id || food._id}
                    food={food}
                    onAddToCart={onAddToCart}
                    onOrderClick={onOrderClick}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <p className="text-muted-foreground text-lg mb-2">
                    {searchQuery || selectedCategory
                      ? "Không tìm thấy món ăn nào"
                      : "Chưa có món ăn nào"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery || selectedCategory
                      ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc"
                      : "Vui lòng quay lại sau hoặc thử danh mục khác"}
                  </p>
                </div>
              </div>
            )}

            {/* View All Button - Chỉ hiển thị khi có nhiều hơn 12 món */}
            {filteredFoods.length > 12 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleViewAllMenu}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Xem tất cả {filteredFoods.length} món
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
