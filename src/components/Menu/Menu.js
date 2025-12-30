"use client"

import { useState, useEffect } from "react"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import MenuCard from "./MenuCard"

export default function Menu() {
  const [categories, setCategories] = useState([])
  const [foods, setFoods] = useState([])
  const [filteredFoods, setFilteredFoods] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null) // null = "Tất cả"
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
          console.log("Categories loaded:", sortedCategories)
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

  // Fetch foods
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true)
        const url = selectedCategory
          ? `/api/food?category_id=${selectedCategory}`
          : "/api/food"
        const response = await fetch(url)
        const data = await response.json()
        if (data.success) {
          // Chỉ hiển thị món còn available
          const availableFoods = data.data.filter((food) => food.is_available !== false)
          setFoods(availableFoods)
          setFilteredFoods(availableFoods)
        } else {
          setError(data.error || "Lỗi khi tải món ăn")
        }
      } catch (err) {
        console.error("Error fetching foods:", err)
        setError("Lỗi khi tải món ăn")
      } finally {
        setLoading(false)
      }
    }

    fetchFoods()
  }, [selectedCategory])

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId)
  }

  return (
    <section id="menu" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-12 scroll-fade-in ${isHeaderVisible ? "visible" : ""}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-50 mb-4">
            Thực đơn
          </h2>
          <div className="w-16 h-1 bg-green-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Khám phá thực đơn đa dạng với các món ăn được chế biến từ nguyên liệu tươi ngon nhất
          </p>
        </div>

        {/* Category Tabs */}
        <div
          ref={contentRef}
          className={`mb-8 scroll-fade-in ${isContentVisible ? "visible" : ""}`}
        >
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {/* Tab "Tất cả" - Luôn hiển thị */}
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                selectedCategory === null
                  ? "bg-green-600 text-white shadow-md shadow-green-500/30"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-50"
              }`}
            >
              Tất cả
            </button>

            {/* Category Tabs */}
            {categories.length > 0 ? (
              categories.map((category) => (
                <button
                  key={category.id || category._id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    selectedCategory === category.id
                      ? "bg-green-600 text-white shadow-md shadow-green-500/30"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-50"
                  }`}
                  style={category.color ? { borderColor: category.color } : {}}
                >
                  {category.icon && <span className="mr-2">{category.icon}</span>}
                  {category.name}
                </button>
              ))
            ) : (
              <div className="text-gray-400 text-sm">Đang tải danh mục...</div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">Đang tải thực đơn...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  setSelectedCategory(null)
                  window.location.reload()
                }}
                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Menu Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food) => <MenuCard key={food.id} food={food} />)
            ) : (
              <div className="col-span-full flex items-center justify-center py-20">
                <div className="text-center">
                  <p className="text-gray-400 text-lg mb-2">
                    {selectedCategory
                      ? "Không có món nào trong danh mục này"
                      : "Chưa có món ăn nào"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Vui lòng quay lại sau hoặc thử danh mục khác
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
