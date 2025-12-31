"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import MenuCard from "./MenuCard"

export default function Menu({ onAddToCart, onOrderClick }) {
  const [categories, setCategories] = useState([])
  const [foods, setFoods] = useState([])
  const [filteredFoods, setFilteredFoods] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null) // null = "Tất cả"
  const [searchQuery, setSearchQuery] = useState("") // Query tìm kiếm
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAll, setShowAll] = useState(false) // Trạng thái hiển thị tất cả món hay chỉ một ít
  const [isTransitioning, setIsTransitioning] = useState(false) // Trạng thái đang chuyển category

  const [headerRef, isHeaderVisible] = useScrollAnimation({ threshold: 0.2 })
  const [contentRef, isContentVisible] = useScrollAnimation({ threshold: 0.2 })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()
        if (data.success) {
          // Sort categories theo order
          const sortedCategories = data.data.sort((a, b) => {
            const orderA = a.order || 999
            const orderB = b.order || 999
            return orderA - orderB
          })
          setCategories(sortedCategories)
        } else {
          console.error("Error fetching categories:", data.error)
          setError(data.error || "Lỗi khi tải danh mục")
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Lỗi khi tải danh mục")
      }
    }

    fetchCategories()
  }, [])

  // Filter foods based on search query
  const applyFilters = (foodsList, query) => {
    let filtered = foodsList

    // Filter by search query
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
        setIsTransitioning(true) // Bắt đầu transition
        
        // Fade out trước
        await new Promise(resolve => setTimeout(resolve, 150))
        
        const url = selectedCategory
          ? `/api/food?category_id=${selectedCategory}`
          : "/api/food"
        const response = await fetch(url)
        const data = await response.json()
        if (data.success) {
          // Chỉ hiển thị món còn available
          const availableFoods = data.data.filter((food) => food.is_available !== false)
          setFoods(availableFoods)
          // Apply search filter nếu có
          applyFilters(availableFoods, searchQuery)
        } else {
          setError(data.error || "Lỗi khi tải món ăn")
        }
      } catch (err) {
        console.error("Error fetching foods:", err)
        setError("Lỗi khi tải món ăn")
      } finally {
        // Fade in sau khi có data
        setTimeout(() => {
          setLoading(false)
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
      // Reset showAll khi search thay đổi
      setShowAll(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const handleCategoryClick = (categoryId) => {
    if (categoryId !== selectedCategory) {
      setSelectedCategory(categoryId)
      // Reset về trạng thái hiển thị giới hạn khi chọn category mới
      setShowAll(false)
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

  const handleShowMore = () => {
    setShowAll(!showAll)
  }

  return (
    <section id="menu" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="max-w-7xl mx-auto overflow-hidden">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-12 scroll-fade-in ${isHeaderVisible ? "visible" : ""}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Thực đơn
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Khám phá thực đơn đa dạng với các món ăn được chế biến từ nguyên liệu tươi ngon nhất
          </p>
        </div>

        {/* Search Bar */}
        <div
          ref={contentRef}
          className={`mb-6 scroll-fade-in ${isContentVisible ? "visible" : ""}`}
        >
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Tìm kiếm món ăn..."
                className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-muted-foreground text-center">
                Tìm thấy {filteredFoods.length} món{filteredFoods.length !== 1 ? "" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {/* Tab "Tất cả" - Luôn hiển thị */}
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "bg-card text-card-foreground hover:bg-muted border border-border"
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
                  className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transform hover:scale-105 active:scale-95 category-tab ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-105"
                      : "bg-card text-card-foreground hover:bg-muted border border-border"
                  }`}
                  style={{
                    ...(category.color ? { borderColor: category.color } : {}),
                    animationDelay: `${index * 0.05}s`
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

        {/* Menu Grid - Chỉ hiển thị một số món đầu tiên trên landing page */}
        {!loading && !error && (
          <>
            {/* Mobile: Horizontal Scroll Layout */}
            <div className="md:hidden">
              {filteredFoods.length > 0 ? (
                <div 
                  className={`flex gap-4 overflow-x-auto pb-4 scrollbar-hide transition-all duration-300 ${
                    isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}
                  style={{
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {filteredFoods
                    .slice(0, showAll ? filteredFoods.length : 6)
                    .map((food, index) => (
                      <div
                        key={food.id}
                        className="menu-item shrink-0 w-[280px]"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          scrollSnapAlign: 'start'
                        }}
                      >
                        <MenuCard food={food} onAddToCart={onAddToCart} onOrderClick={onOrderClick} />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center animate-fade-in">
                    <p className="text-muted-foreground text-lg mb-2">
                      {searchQuery
                        ? `Không tìm thấy món nào với từ khóa "${searchQuery}"`
                        : selectedCategory
                        ? "Không có món nào trong danh mục này"
                        : "Chưa có món ăn nào"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {searchQuery
                        ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc"
                        : "Vui lòng quay lại sau hoặc thử danh mục khác"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tablet/Desktop: Grid Layout */}
            <div 
              className={`hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 transition-all duration-300 items-stretch ${
                isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {filteredFoods.length > 0 ? (
                // Chỉ hiển thị 6 món đầu tiên, nếu showAll = true thì hiển thị tất cả
                filteredFoods
                  .slice(0, showAll ? filteredFoods.length : 6)
                  .map((food, index) => (
                    <div
                      key={food.id}
                      className="menu-item"
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <MenuCard food={food} onAddToCart={onAddToCart} />
                    </div>
                  ))
              ) : (
                <div className="col-span-full flex items-center justify-center py-20">
                  <div className="text-center animate-fade-in">
                    <p className="text-muted-foreground text-lg mb-2">
                      {selectedCategory
                        ? "Không có món nào trong danh mục này"
                        : "Chưa có món ăn nào"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Vui lòng quay lại sau hoặc thử danh mục khác
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Nút "Xem thêm" nếu có nhiều hơn 6 món */}
            {filteredFoods.length > 6 && (
              <div 
                className="flex justify-center mt-8 transition-all duration-500"
                style={{
                  animation: showAll ? 'slideDown 0.4s ease-out' : 'slideUp 0.4s ease-out'
                }}
              >
                <button
                  onClick={handleShowMore}
                  className="px-8 py-3 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg font-medium transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {showAll ? (
                      <>
                        <span>Thu gọn</span>
                        <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Xem thêm {filteredFoods.length - 6} món</span>
                        <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
