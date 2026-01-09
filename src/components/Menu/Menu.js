"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, ArrowRight, TrendingUp, ArrowDown } from "lucide-react"
import * as lucideIcons from "lucide-react"
import { useRouter } from "next/navigation"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import MenuCard from "./MenuCard"
import { useLandingConfig } from "@/hooks/useLandingConfig"

// Component tinh tế để scroll xuống section tiếp theo
function ScrollToNextSection({ targetId }) {
  const scrollToNext = () => {
    const element = document.getElementById(targetId)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="flex justify-center mt-6 md:mt-8 pb-4">
      <button
        onClick={scrollToNext}
        className="group flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer"
        aria-label={`Cuộn xuống ${targetId}`}
      >
        <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Xem thêm
        </span>
        <div className="relative">
          <ArrowDown className="w-5 h-5 animate-bounce" />
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </button>
    </div>
  )
}

// Helper function để chuyển đổi kebab-case sang PascalCase
const toPascalCase = (str) => {
  if (!str) return str;
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// Helper function để lấy icon component từ lucide-react
const getLucideIcon = (iconName) => {
  if (!iconName || typeof iconName !== 'string') {
    return TrendingUp; // Fallback
  }
  
  // Thử các format khác nhau:
  const variants = [
    iconName, // Tên gốc
    toPascalCase(iconName), // Chuyển kebab-case sang PascalCase
    iconName + 'Icon', // Với suffix Icon
    toPascalCase(iconName) + 'Icon', // PascalCase + Icon
  ];
  
  // Loại bỏ duplicates
  const uniqueVariants = [...new Set(variants)];
  
  for (const variant of uniqueVariants) {
    const icon = lucideIcons[variant];
    if (icon) {
      // Nếu là object với default export, lấy default
      if (typeof icon === 'object' && icon.default) {
        return icon.default;
      }
      // Nếu là function hoặc React component, trả về trực tiếp
      if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof)) {
        return icon;
      }
    }
  }
  
  // Fallback về TrendingUp nếu không tìm thấy
  return TrendingUp;
};

// Component wrapper cho food card với scroll-fade-in
function FoodCardWrapper({ children, delay = 0 }) {
  const [cardRef, isCardVisible] = useScrollAnimation({ threshold: 0.1 })
  
  return (
    <div
      ref={cardRef}
      className={`h-full scroll-fade-in ${isCardVisible ? "visible" : ""}`}
      style={{
        transitionDelay: isCardVisible ? `${delay}s` : '0s'
      }}
    >
      {children}
    </div>
  )
}

export default function Menu({ onAddToCart, onOrderClick }) {
  const { config } = useLandingConfig()
  const menuConfig = config?.menu || {}
  const sectionTitle = menuConfig.section_title || 'Thực đơn'
  const sectionDescription = menuConfig.section_description || 'Khám phá những món ăn được yêu thích nhất'
  const popularTitle = menuConfig.popular_title || 'Món nổi bật'
  const popularIcon = menuConfig.popular_icon || '🔥'
  const popularLucideIconName = menuConfig.popular_lucide_icon || 'TrendingUp'
  
  const PopularLucideIcon = getLucideIcon(popularLucideIconName)
  
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
  const [isShowingPopular, setIsShowingPopular] = useState(false) // Đang hiển thị món nổi bật
  const [thresholds, setThresholds] = useState([]) // Danh sách ngưỡng
  const [popularFoodsMap, setPopularFoodsMap] = useState({}) // Map food_id -> total_quantity
  const [showValue, setShowValue] = useState(true) // Cài đặt hiển thị giá trị
  const menuSectionRef = useRef(null)
  const stickyBarRef = useRef(null)
  const categoryTabsRef = useRef(null) // Ref cho category tabs gốc

  const [headerRef, isHeaderVisible] = useScrollAnimation({ threshold: 0.2 })
  const [contentRef, isContentVisible] = useScrollAnimation({ threshold: 0.2 })
  const [popularTitleRef, isPopularTitleVisible] = useScrollAnimation({ threshold: 0.1 })
  const [badgesRef, isBadgesVisible] = useScrollAnimation({ threshold: 0.2 })
  const [viewAllButtonRef, isViewAllButtonVisible] = useScrollAnimation({ threshold: 0.1 })

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

  // Helper function để tính badge cho food (Kết hợp Tự động + Thủ công)
  const getBadgeForFood = (food, thresholds, popularFoodsMap) => {
    // Bước 1: Kiểm tra manual_badge (Ưu tiên cao nhất)
    if (food.manual_badge) {
      // Nếu có threshold_id → lấy badge từ ngưỡng đó
      if (food.manual_badge.threshold_id) {
        const threshold = thresholds.find(t => t._id === food.manual_badge.threshold_id)
        if (threshold) {
          return {
            ...threshold,
            isManual: true
          }
        }
      }
      // Nếu không có threshold_id → dùng badge tùy chỉnh
      if (food.manual_badge.label && food.manual_badge.icon && food.manual_badge.color) {
        return {
          label: food.manual_badge.label,
          icon: food.manual_badge.icon,
          color: food.manual_badge.color,
          value: 0,
          order: 0,
          isManual: true
        }
      }
    }
    
    // Bước 2: Hệ thống tự động (Fallback)
    if (food.use_auto_badge !== false) {
      const totalQuantity = popularFoodsMap[food.id] || food.total_quantity || 0
      if (totalQuantity > 0 && thresholds.length > 0) {
        const matchedThreshold = thresholds.find(t => totalQuantity >= t.value)
        if (matchedThreshold) {
          return {
            ...matchedThreshold,
            isManual: false
          }
        }
      }
    }
    
    // Bước 3: Không có badge
    return null
  }

  // Fetch thresholds, popular foods và settings song song
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [thresholdsResponse, popularFoodsResponse, settingsResponse] = await Promise.all([
          fetch('/api/config/popular?sortBy=value'),
          fetch('/api/food/popular?limit=1000'),
          fetch('/api/config/popular/settings')
        ])

        const [thresholdsResult, popularFoodsResult, settingsResult] = await Promise.all([
          thresholdsResponse.json(),
          popularFoodsResponse.json(),
          settingsResponse.json()
        ])

        if (thresholdsResult.success && Array.isArray(thresholdsResult.data)) {
          const sorted = [...thresholdsResult.data].sort((a, b) => b.value - a.value)
          setThresholds(sorted)
        }

        if (popularFoodsResult.success && Array.isArray(popularFoodsResult.data)) {
          const map = {}
          popularFoodsResult.data.forEach(food => {
            if (food.id && food.total_quantity) {
              map[food.id] = food.total_quantity
            }
          })
          setPopularFoodsMap(map)
        }

        if (settingsResult.success && settingsResult.data) {
          setShowValue(settingsResult.data.show_value !== false)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  // Fetch foods - ưu tiên món nổi bật khi không chọn category, fallback về thứ tự mặc định
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setIsTransitioning(true)
        
        // Nếu đã chọn category → fetch theo category (không dùng món nổi bật)
        if (selectedCategory !== null) {
          setIsShowingPopular(false) // Không phải món nổi bật khi chọn category
          const url = `/api/food?category_id=${selectedCategory}`
          const response = await fetch(url)
          const data = await response.json()
          if (data.success) {
            setFoods(data.data || [])
            applyFilters(data.data || [], searchQuery)
          } else {
            setError(data.error || "Không thể tải danh sách món ăn")
          }
          setLoading(false)
          setTimeout(() => {
            setIsTransitioning(false)
          }, 150)
          return
        }
        
        // Nếu chưa chọn category (selectedCategory === null) → Ưu tiên món có badge thủ công
        if (selectedCategory === null) {
          // Fetch tất cả món để có thể sắp xếp theo badge thủ công
          const response = await fetch("/api/food?limit=100")
          const data = await response.json()
          
          if (data.success && data.data) {
            const availableFoods = data.data.filter((food) => food.is_available !== false)
            
            // Tính badge cho mỗi food và thêm total_quantity
            const foodsWithBadge = availableFoods.map(food => {
              const totalQuantity = popularFoodsMap[food.id] || 0
              const badge = getBadgeForFood(food, thresholds, popularFoodsMap)
              return {
                ...food,
                total_quantity: totalQuantity,
                matchedThreshold: badge
              }
            })
            
            // Sắp xếp: Ưu tiên món có manual_badge lên đầu, sau đó là món có auto badge
            const sortedFoods = foodsWithBadge.sort((a, b) => {
              // Ưu tiên 1: Món có manual_badge
              const aHasManual = a.matchedThreshold?.isManual === true
              const bHasManual = b.matchedThreshold?.isManual === true
              if (aHasManual && !bHasManual) return -1
              if (!aHasManual && bHasManual) return 1
              
              // Ưu tiên 2: Món có auto badge (total_quantity cao hơn)
              if (!aHasManual && !bHasManual) {
                const aHasAuto = a.matchedThreshold && !a.matchedThreshold.isManual
                const bHasAuto = b.matchedThreshold && !b.matchedThreshold.isManual
                if (aHasAuto && !bHasAuto) return -1
                if (!aHasAuto && bHasAuto) return 1
                if (aHasAuto && bHasAuto) {
                  return (b.total_quantity || 0) - (a.total_quantity || 0)
                }
              }
              
              // Ưu tiên 3: Món có manual_badge với order cao hơn (nếu có)
              if (aHasManual && bHasManual) {
                const aOrder = a.matchedThreshold?.order || 0
                const bOrder = b.matchedThreshold?.order || 0
                if (aOrder !== bOrder) return bOrder - aOrder
              }
              
              return 0
            })
            
            // Giới hạn 5 món
            const top5Foods = sortedFoods.slice(0, 5)
            
            // Kiểm tra xem có món nào có badge không
            const hasBadge = top5Foods.some(f => f.matchedThreshold)
            setIsShowingPopular(hasBadge)
            
            setFoods(top5Foods)
            applyFilters(top5Foods, searchQuery)
            setLoading(false)
            setTimeout(() => {
              setIsTransitioning(false)
            }, 150)
            return
          }
        }
        
        // Fallback: Lấy tất cả món theo thứ tự mặc định
        setIsShowingPopular(false)
        const response = await fetch("/api/food")
        const data = await response.json()
        if (data.success) {
          const availableFoods = data.data.filter((food) => food.is_available !== false)
          // Tính badge cho mỗi food
          const foodsWithBadge = availableFoods.map(food => {
            const totalQuantity = popularFoodsMap[food.id] || 0
            const badge = getBadgeForFood(food, thresholds, popularFoodsMap)
            return {
              ...food,
              total_quantity: totalQuantity,
              matchedThreshold: badge
            }
          })
          setFoods(foodsWithBadge)
          applyFilters(foodsWithBadge, searchQuery)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, thresholds, popularFoodsMap])

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
    <section id="menu" ref={menuSectionRef} className="pb-8 md:pb-12 px-4 sm:px-6 lg:px-8 bg-muted relative">
      <div className="max-w-7xl mx-auto overflow-hidden">
        {/* Section Header - Design đặc biệt cho landing page */}
        <div
          ref={headerRef}
          className={`scroll-fade-in ${isHeaderVisible ? "visible" : ""} mb-6 md:mb-8 text-center`}
        >
          <div className="relative inline-block">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/20 to-primary/10 rounded-3xl blur-2xl -z-10 transform scale-110"></div>
            
            <div className="relative px-8 py-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-2 bg-linear-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
            {sectionTitle}
          </h2>
              {/* Divider */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="h-px w-8 sm:w-12 bg-linear-to-r from-transparent to-primary"></div>
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary"></div>
                <div className="h-px w-8 sm:w-12 bg-linear-to-r from-primary to-transparent"></div>
              </div>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                {sectionDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs và Search Bar - Ẩn trên landing page để tập trung vào preview */}

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

        {/* Section Header - Món nổi bật - Gọn gàng */}
        {!loading && !error && isShowingPopular && selectedCategory === null && !searchQuery && (
          <>
            <div className={`mb-4 md:mb-6 flex items-center justify-center gap-2 scroll-fade-in ${isPopularTitleVisible ? "visible" : ""}`} ref={popularTitleRef}>
              <PopularLucideIcon className="w-5 h-5 text-primary" />
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-primary">
                {popularTitle}
              </h3>
              <span className="text-lg">{popularIcon}</span>
            </div>
            
            {/* Hiển thị giá trị các ngưỡng */}
            {(() => {
              // Lấy manual badges từ 5 món đang hiển thị
              const top5Foods = filteredFoods.slice(0, 5)
              const manualBadges = []
              const thresholdIdsInUse = new Set()
              
              top5Foods.forEach(food => {
                if (food.matchedThreshold?.isManual === true) {
                  const badge = food.matchedThreshold
                  // Nếu có _id (từ threshold config) thì đã có trong thresholds rồi, chỉ track lại
                  if (badge._id) {
                    thresholdIdsInUse.add(badge._id)
                  } else {
                    // Nếu là custom badge (không có _id), thêm vào danh sách
                    // Kiểm tra duplicate dựa trên label + icon + color
                    const isDuplicate = manualBadges.some(b => 
                      b.label === badge.label && 
                      b.icon === badge.icon && 
                      b.color === badge.color
                    )
                    if (!isDuplicate) {
                      manualBadges.push(badge)
                    }
                  }
                }
              })
              
              // Kết hợp thresholds và manual badges custom
              // Loại bỏ duplicate: nếu manual badge có _id thì đã có trong thresholds rồi
              const allBadges = [
                ...thresholds,
                ...manualBadges.filter(b => !b._id) // Chỉ lấy custom badges (không có _id)
              ]
              
              if (allBadges.length === 0) return null
              
              return (
                <div className={`mb-6 flex flex-wrap items-center justify-center gap-3 md:gap-4 scroll-fade-in ${isBadgesVisible ? "visible" : ""}`} ref={badgesRef}>
                  {allBadges.map((badge, index) => (
                    <div
                      key={badge._id || `manual-${badge.label}-${badge.icon}-${badge.color}-${index}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border backdrop-blur-sm"
                      style={{
                        backgroundColor: `${badge.color}10`,
                        borderColor: `${badge.color}30`,
                      }}
                    >
                      <span className="text-sm">{badge.icon}</span>
                      <span 
                        className="text-xs font-semibold"
                        style={{
                          color: badge.color,
                        }}
                      >
                        {badge.label}
                      </span>
                      {showValue && badge._id && badge.value !== undefined && badge.value !== null && (
                        <span className="text-xs text-muted-foreground font-medium">
                          (≥{badge.value})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )
            })()}
          </>
        )}

        {/* Menu Preview - Grid 5 cột desktop */}
        {!loading && !error && (
          <>
              {filteredFoods.length > 0 ? (
              <>
                {/* Grid responsive: 2 cột mobile, 3 cột tablet, 5 cột desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                  {filteredFoods.slice(0, 5).map((food, index) => (
                    <FoodCardWrapper key={food.id || food._id} delay={index * 0.1}>
                      <div className="menu-item h-full">
                        <MenuCard
                          food={food}
                          onAddToCart={onAddToCart}
                          onOrderClick={onOrderClick}
                          isPopular={food.matchedThreshold !== null}
                          thresholds={thresholds}
                          matchedThreshold={food.matchedThreshold}
                        />
                      </div>
                    </FoodCardWrapper>
                  ))}
                </div>

                {/* View All Button - Ngay sau 5 items (1 hàng) */}
                <div className={`flex justify-center mt-6 md:mt-8 p-2 scroll-fade-in ${isViewAllButtonVisible ? "visible" : ""}`} ref={viewAllButtonRef}>
                  <button
                    onClick={handleViewAllMenu}
                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg text-sm sm:text-base font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 cursor-pointer"
                  >
                    Xem tất cả
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Subtle Scroll Indicator - Cuộn xuống WhyChooseUs */}
                <ScrollToNextSection targetId="why-choose-us" />
              </>
            ) : (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <p className="text-muted-foreground text-sm sm:text-base mb-2">
                    {searchQuery || selectedCategory
                      ? "Không tìm thấy món ăn nào"
                        : "Chưa có món ăn nào"}
                    </p>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                    {searchQuery || selectedCategory
                      ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc"
                      : "Vui lòng quay lại sau hoặc thử danh mục khác"}
                    </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
