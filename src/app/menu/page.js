export const runtime = 'edge';

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header/Header"
import Footer from "@/components/Footer/Footer"
import { Search, X, ArrowLeft, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"
import MenuCard from "@/components/Menu/MenuCard"
import Cart from "@/components/Cart/Cart"
import Auth from "@/components/Auth/Auth"
import UserProfile from "@/components/UserProfile/UserProfile"
import OrderHistory from "@/components/OrderHistory/OrderHistory"
import OrderForm from "@/components/OrderForm/OrderForm"
import Toast from "@/components/Toast/Toast"
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
  const [selectedThreshold, setSelectedThreshold] = useState(null) // Ngưỡng được chọn để lọc (có thể là threshold._id hoặc custom badge key)
  const [thresholds, setThresholds] = useState([]) // Danh sách ngưỡng từ database
  const [customBadges, setCustomBadges] = useState([]) // Danh sách badge tùy chỉnh (manual_badge không có threshold_id)
  const [popularFoodsMap, setPopularFoodsMap] = useState({}) // Map food_id -> total_quantity
  const [showValue, setShowValue] = useState(true) // Cài đặt hiển thị giá trị
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [flyingItem, setFlyingItem] = useState(null)
  const [toast, setToast] = useState({ message: "", isVisible: false, type: "success" })
  const [isSticky, setIsSticky] = useState(false) // Sticky search và category bar
  const [isCartOpen, setIsCartOpen] = useState(false) // State để quản lý cart
  const [isAuthOpen, setIsAuthOpen] = useState(false) // State để quản lý auth modal
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false) // State để quản lý user profile
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false) // State để quản lý order history
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false) // State để quản lý order form
  const [orderFormItems, setOrderFormItems] = useState(null) // Items để đặt hàng
  const [authTab, setAuthTab] = useState("login") // Tab mặc định cho auth modal
  const menuSectionRef = useRef(null)
  const stickyBarRef = useRef(null)
  const categoryTabsRef = useRef(null) // Ref cho category tabs gốc

  // Listen for toast events from OrderForm
  useEffect(() => {
    const handleShowToast = (event) => {
      setToast({
        message: event.detail.message,
        isVisible: true,
        type: event.detail.type || "success",
      })
    }

    window.addEventListener("showToast", handleShowToast)
    return () => window.removeEventListener("showToast", handleShowToast)
  }, [])

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
          value: 0, // Không có value cho manual badge
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

  // Fetch thresholds, popular foods và settings song song để tối ưu performance
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cả ba API song song
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

        // Set thresholds
        if (thresholdsResult.success && Array.isArray(thresholdsResult.data)) {
          const sorted = [...thresholdsResult.data].sort((a, b) => b.value - a.value)
          setThresholds(sorted)
        }

        // Set popularFoodsMap
        if (popularFoodsResult.success && Array.isArray(popularFoodsResult.data)) {
          const map = {}
          popularFoodsResult.data.forEach(food => {
            if (food.id && food.total_quantity) {
              map[food.id] = food.total_quantity
            }
          })
          setPopularFoodsMap(map)
        }

        // Set showValue
        if (settingsResult.success && settingsResult.data) {
          setShowValue(settingsResult.data.show_value !== false)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  // Filter foods - Chỉ filter client-side cho search và threshold, pagination sẽ ở server-side
  const applyFilters = (foodsList, query, thresholdId = null) => {
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

    // Filter by threshold (bao gồm cả manual_badge và custom badges)
    if (thresholdId) {
      // Kiểm tra xem là custom badge hay threshold từ database
      if (thresholdId.startsWith('custom_')) {
        // Custom badge: filter theo manual_badge tùy chỉnh
        const customBadge = customBadges.find(b => b._id === thresholdId)
        if (customBadge) {
          filtered = filtered.filter((food) => {
            // Kiểm tra manual_badge tùy chỉnh match
            if (food.manual_badge && !food.manual_badge.threshold_id) {
              return food.manual_badge.label === customBadge.label &&
                food.manual_badge.icon === customBadge.icon &&
                food.manual_badge.color === customBadge.color
            }
            return false
          })
        }
      } else {
        // Threshold từ database
        const threshold = thresholds.find(t => t._id === thresholdId)
        if (threshold) {
          filtered = filtered.filter((food) => {
            // Kiểm tra manual_badge trước (ưu tiên)
            if (food.manual_badge && food.manual_badge.threshold_id === thresholdId) {
              return true
            }

            // Nếu không có manual_badge hoặc manual_badge không match
            // Kiểm tra auto badge: total_quantity >= threshold.value
            if (food.use_auto_badge !== false) {
              const totalQuantity = popularFoodsMap[food.id] || food.total_quantity || 0
              if (totalQuantity >= threshold.value) {
                // Kiểm tra xem có threshold nào cao hơn match không
                const higherThreshold = thresholds.find(t =>
                  t.value > threshold.value && totalQuantity >= t.value
                )
                // Chỉ match với threshold cao nhất
                return !higherThreshold
              }
            }

            return false
          })
        }
      }
    }

    setFilteredFoods(filtered)
  }

  // Fetch foods với pagination
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true)
        setIsTransitioning(true)
        await new Promise(resolve => setTimeout(resolve, 150))

        // Nếu có threshold filter, fetch tất cả items để filter chính xác
        // Nếu không, dùng pagination bình thường
        const limit = selectedThreshold ? 10000 : pagination.limit
        const page = selectedThreshold ? 1 : pagination.page

        // Build URL với pagination và filters
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        })

        if (selectedCategory) {
          params.append('category_id', selectedCategory)
        }

        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim())
        }

        const response = await fetch(`/api/food?${params}`)
        const data = await response.json()
        if (data.success) {
          const availableFoods = data.data.filter((food) => food.is_available !== false)
          // Thêm total_quantity và badge vào mỗi food (Kết hợp Tự động + Thủ công)
          const foodsWithQuantity = availableFoods.map(food => {
            const totalQuantity = popularFoodsMap[food.id] || 0
            // Tính badge dựa trên logic ưu tiên
            const badge = getBadgeForFood(food, thresholds, popularFoodsMap)
            return {
              ...food,
              total_quantity: totalQuantity,
              matchedThreshold: badge // matchedThreshold giờ có thể là manual hoặc auto
            }
          })
          setFoods(foodsWithQuantity)

          // Apply threshold filter client-side (bao gồm cả manual_badge và custom badges)
          let filtered = foodsWithQuantity
          if (selectedThreshold) {
            // Kiểm tra xem là custom badge hay threshold từ database
            if (selectedThreshold.startsWith('custom_')) {
              // Custom badge: filter theo manual_badge tùy chỉnh
              const customBadge = customBadges.find(b => b._id === selectedThreshold)
              if (customBadge) {
                filtered = filtered.filter((food) => {
                  // Kiểm tra manual_badge tùy chỉnh match
                  if (food.manual_badge && !food.manual_badge.threshold_id) {
                    return food.manual_badge.label === customBadge.label &&
                      food.manual_badge.icon === customBadge.icon &&
                      food.manual_badge.color === customBadge.color
                  }
                  return false
                })
              }
            } else {
              // Threshold từ database
              const threshold = thresholds.find(t => t._id === selectedThreshold)
              if (threshold) {
                filtered = filtered.filter((food) => {
                  // Kiểm tra manual_badge trước (ưu tiên)
                  if (food.manual_badge && food.manual_badge.threshold_id === selectedThreshold) {
                    return true
                  }

                  // Nếu không có manual_badge hoặc manual_badge không match
                  // Kiểm tra auto badge: total_quantity >= threshold.value
                  if (food.use_auto_badge !== false) {
                    const totalQuantity = food.total_quantity || 0
                    if (totalQuantity >= threshold.value) {
                      // Kiểm tra xem có threshold nào cao hơn match không
                      const higherThreshold = thresholds.find(t =>
                        t.value > threshold.value && totalQuantity >= t.value
                      )
                      // Chỉ match với threshold cao nhất
                      return !higherThreshold
                    }
                  }

                  return false
                })
              }
            }
          }

          // Nếu có threshold filter, paginate client-side
          if (selectedThreshold) {
            const startIndex = (pagination.page - 1) * pagination.limit
            const endIndex = startIndex + pagination.limit
            const paginatedFiltered = filtered.slice(startIndex, endIndex)
            setFilteredFoods(paginatedFiltered)

            // Update pagination dựa trên filtered items
            setPagination(prev => ({
              ...prev,
              total: filtered.length,
              totalPages: Math.ceil(filtered.length / prev.limit),
            }))
          } else {
            // Không có threshold filter, dùng pagination từ server
            setFilteredFoods(filtered)
            if (data.pagination) {
              setPagination(prev => ({
                ...prev,
                total: data.pagination.total || 0,
                totalPages: data.pagination.totalPages || 0,
              }))
            }
          }
        } else {
          setError(data.error || "Lỗi khi tải sản phẩm")
        }
      } catch (err) {
        console.error("Error fetching foods:", err)
        setError("Lỗi khi tải sản phẩm")
      } finally {
        setTimeout(() => {
          setLoading(false)
          setIsTransitioning(false)
        }, 150)
      }
    }
    fetchFoods()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, pagination.page, searchQuery, selectedThreshold])

  // Thu thập các badge tùy chỉnh (manual_badge không có threshold_id) từ foods
  useEffect(() => {
    if (foods.length > 0) {
      const customBadgesMap = new Map()

      foods.forEach(food => {
        if (food.manual_badge && !food.manual_badge.threshold_id) {
          // Có manual_badge tùy chỉnh (không có threshold_id)
          if (food.manual_badge.label && food.manual_badge.icon && food.manual_badge.color) {
            // Tạo key unique dựa trên label, icon, color
            const key = `${food.manual_badge.label}|${food.manual_badge.icon}|${food.manual_badge.color}`

            if (!customBadgesMap.has(key)) {
              customBadgesMap.set(key, {
                _id: `custom_${key}`, // ID tạm cho custom badge
                label: food.manual_badge.label,
                icon: food.manual_badge.icon,
                color: food.manual_badge.color,
                value: 0,
                order: 999, // Đặt order cao để hiển thị sau thresholds
                isCustom: true
              })
            }
          }
        }
      })

      setCustomBadges(Array.from(customBadgesMap.values()))
    }
  }, [foods])

  // Update foods và filteredFoods khi popularFoodsMap hoặc thresholds thay đổi
  // Đảm bảo matchedThreshold luôn được tính lại và filteredFoods được update
  useEffect(() => {
    if (foods.length > 0) {
      // Tính lại badge cho tất cả foods dựa trên logic ưu tiên (Kết hợp Tự động + Thủ công)
      const foodsWithQuantity = foods.map(food => {
        const totalQuantity = popularFoodsMap[food.id] || food.total_quantity || 0
        // Tính badge dựa trên logic ưu tiên
        const badge = getBadgeForFood(food, thresholds, popularFoodsMap)
        return {
          ...food,
          total_quantity: totalQuantity,
          matchedThreshold: badge
        }
      })

      // Luôn update foods để đảm bảo matchedThreshold được cập nhật (tránh race condition)
      setFoods(foodsWithQuantity)

      // Luôn update filteredFoods để đảm bảo badge hiển thị đúng
      setFilteredFoods(prevFiltered => {
        // Nếu chưa có filteredFoods, tạo mới từ foodsWithQuantity
        if (prevFiltered.length === 0) {
          let filtered = foodsWithQuantity
          if (selectedThreshold) {
            // Kiểm tra xem là custom badge hay threshold từ database
            if (selectedThreshold.startsWith('custom_')) {
              // Custom badge: filter theo manual_badge tùy chỉnh
              const customBadge = customBadges.find(b => b._id === selectedThreshold)
              if (customBadge) {
                filtered = filtered.filter((food) => {
                  // Kiểm tra manual_badge tùy chỉnh match
                  if (food.manual_badge && !food.manual_badge.threshold_id) {
                    return food.manual_badge.label === customBadge.label &&
                      food.manual_badge.icon === customBadge.icon &&
                      food.manual_badge.color === customBadge.color
                  }
                  return false
                })
              }
            } else {
              // Threshold từ database
              const threshold = thresholds.find(t => t._id === selectedThreshold)
              if (threshold) {
                filtered = filtered.filter((food) => {
                  // Kiểm tra manual_badge trước (ưu tiên)
                  if (food.manual_badge && food.manual_badge.threshold_id === selectedThreshold) {
                    return true
                  }

                  // Nếu không có manual_badge hoặc manual_badge không match
                  // Kiểm tra auto badge: total_quantity >= threshold.value
                  if (food.use_auto_badge !== false) {
                    const totalQuantity = food.total_quantity || 0
                    if (totalQuantity >= threshold.value) {
                      // Kiểm tra xem có threshold nào cao hơn match không
                      const higherThreshold = thresholds.find(t =>
                        t.value > threshold.value && totalQuantity >= t.value
                      )
                      // Chỉ match với threshold cao nhất
                      return !higherThreshold
                    }
                  }

                  return false
                })
              }
            }
          }

          if (selectedThreshold) {
            const startIndex = (pagination.page - 1) * pagination.limit
            const endIndex = startIndex + pagination.limit
            return filtered.slice(startIndex, endIndex)
          }
          return filtered
        } else {
          // Update matchedThreshold cho các items trong filteredFoods
          const updated = prevFiltered.map(filteredFood => {
            const updatedFood = foodsWithQuantity.find(f =>
              (f.id && filteredFood.id && f.id === filteredFood.id) ||
              (f._id && filteredFood._id && f._id === filteredFood._id) ||
              (f.id && filteredFood._id && f.id === filteredFood._id) ||
              (f._id && filteredFood.id && f._id === filteredFood.id)
            )
            if (updatedFood) {
              return {
                ...filteredFood,
                total_quantity: updatedFood.total_quantity,
                matchedThreshold: updatedFood.matchedThreshold
              }
            }
            return filteredFood
          })

          // Luôn return updated để đảm bảo badge được update
          return updated
        }
      })

      // Update pagination nếu có threshold filter
      if (selectedThreshold) {
        let filtered = foodsWithQuantity
        // Kiểm tra xem là custom badge hay threshold từ database
        if (selectedThreshold.startsWith('custom_')) {
          // Custom badge: filter theo manual_badge tùy chỉnh
          const customBadge = customBadges.find(b => b._id === selectedThreshold)
          if (customBadge) {
            filtered = filtered.filter((food) => {
              // Kiểm tra manual_badge tùy chỉnh match
              if (food.manual_badge && !food.manual_badge.threshold_id) {
                return food.manual_badge.label === customBadge.label &&
                  food.manual_badge.icon === customBadge.icon &&
                  food.manual_badge.color === customBadge.color
              }
              return false
            })
          }
        } else {
          // Threshold từ database
          const threshold = thresholds.find(t => t._id === selectedThreshold)
          if (threshold) {
            filtered = filtered.filter((food) => {
              // Kiểm tra manual_badge trước (ưu tiên)
              if (food.manual_badge && food.manual_badge.threshold_id === selectedThreshold) {
                return true
              }

              // Nếu không có manual_badge hoặc manual_badge không match
              // Kiểm tra auto badge: total_quantity >= threshold.value
              if (food.use_auto_badge !== false) {
                const totalQuantity = food.total_quantity || 0
                if (totalQuantity >= threshold.value) {
                  // Kiểm tra xem có threshold nào cao hơn match không
                  const higherThreshold = thresholds.find(t =>
                    t.value > threshold.value && totalQuantity >= t.value
                  )
                  // Chỉ match với threshold cao nhất
                  return !higherThreshold
                }
              }

              return false
            })
          }
        }
        setPagination(prev => ({
          ...prev,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / prev.limit),
        }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popularFoodsMap, thresholds])

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
      setSelectedThreshold(null) // Reset threshold khi đổi category
      setPagination(prev => ({ ...prev, page: 1 })) // Reset về trang 1
    }
  }

  const handleThresholdClick = (thresholdId) => {
    if (thresholdId === selectedThreshold) {
      // Click lại vào threshold đang chọn → bỏ lọc
      setSelectedThreshold(null)
    } else {
      setSelectedThreshold(thresholdId)
      // Không reset page vì threshold filter là client-side
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    // Scroll to top khi đổi trang
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset về trang 1 khi search
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

    // MenuCard đã tự thêm vào cart rồi, chỗ này chỉ xử lý animation/toast
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const handleCartClick = () => {
    setIsCartOpen(true)
  }

  const handleCartClose = () => {
    setIsCartOpen(false)
  }

  const handleCheckout = (cart) => {
    setIsCartOpen(false)
    setOrderFormItems(cart)
    setIsOrderFormOpen(true)
  }

  const handleOrderClick = (food) => {
    // Thêm món vào giỏ hàng và mở form đặt hàng ngay
    addToCart({
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      category_id: food.category_id,
      quantity: 1,
    })
    window.dispatchEvent(new CustomEvent("cartUpdated"))

    const cart = [{
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      quantity: 1
    }]
    setOrderFormItems(cart)
    setIsOrderFormOpen(true)
  }

  const handleLoginClick = () => {
    setAuthTab("login")
    setIsAuthOpen(true)
  }

  const handleProfileClick = () => {
    setIsUserProfileOpen(true)
  }

  const handleOrderHistoryClick = () => {
    setIsOrderHistoryOpen(true)
  }

  const handleOrderSuccess = (orderData) => {
    // Không đóng OrderForm ngay để success screen hiển thị
    // OrderForm sẽ tự dispatch showToast event và hiển thị success screen
    // Clear cart after successful order (OrderForm đã tự clear, nhưng dispatch event để update UI)
    window.dispatchEvent(new CustomEvent("cartUpdated"))
  }

  const handleCloseToast = () => {
    setToast({ ...toast, isVisible: false })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCartClick={handleCartClick}
        onLoginClick={handleLoginClick}
        onProfileClick={handleProfileClick}
        onOrderHistoryClick={handleOrderHistoryClick}
      />
      <main className="pt-20" ref={menuSectionRef}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Sticky Search and Category Bar - Chỉ hiện khi scroll */}
          <div
            ref={stickyBarRef}
            className={`fixed top-16 sm:top-20 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-md py-3 px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out ${isSticky
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-4 pointer-events-none'
              }`}
          >
            <div className="max-w-6xl mx-auto">
              {/* Search Bar */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-primary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
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
                    Tìm thấy {filteredFoods.length} sản phẩm{filteredFoods.length !== 1 ? "" : ""}
                  </p>
                )}
              </div>

              {/* Category Tabs */}
              <div className="relative">
                <div className="flex py-2 items-center px-2 gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide md:justify-center md:flex-wrap md:overflow-x-visible md:pb-0">
                  {/* Tab "Tất cả" */}
                  <button
                    onClick={() => handleCategoryClick(null)}
                    className={`shrink-0 px-3 md:px-6 py-1.5 md:py-2 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer text-sm md:text-base ${selectedCategory === null
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/40 scale-105"
                      : "bg-card text-card-foreground hover:bg-primary/10 border border-border hover:scale-105 hover:border-primary/50"
                      }`}
                  >
                    Tất cả
                  </button>

                  {/* Category Tabs */}
                  {categories.map((category, index) => (
                    <button
                      key={category.id || category._id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`shrink-0 px-3 md:px-6 py-1.5 md:py-2 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background active:scale-95 category-tab cursor-pointer hover:scale-105 text-sm md:text-base ${selectedCategory === category.id
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
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back()
                } else {
                  window.location.href = '/'
                }
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors cursor-pointer hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại</span>
            </button>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-2">
              Sản phẩm
            </h1>
            <p className="text-muted-foreground">
              Khám phá đa dạng
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
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
                Tìm thấy {filteredFoods.length} sản phẩm
              </p>
            )}
          </div>

          {/* Thresholds Filter - Hiển thị giá trị các ngưỡng và badge tùy chỉnh */}
          {(thresholds.length > 0 || customBadges.length > 0) && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-card-foreground">Lọc theo độ nổi bật</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                {/* Thresholds từ database */}
                {thresholds.map((threshold) => {
                  const isActive = selectedThreshold === threshold._id

                  return (
                    <button
                      key={threshold._id}
                      onClick={() => handleThresholdClick(threshold._id)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md border backdrop-blur-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer hover:scale-105 ${isActive
                        ? "shadow-md scale-105 ring-2 ring-offset-2"
                        : "hover:shadow-sm"
                        }`}
                      style={{
                        backgroundColor: isActive
                          ? `${threshold.color}30`
                          : `${threshold.color}10`,
                        borderColor: isActive
                          ? `${threshold.color}60`
                          : `${threshold.color}30`,
                        ringColor: isActive ? threshold.color : undefined,
                      }}
                    >
                      <span className="text-sm">{threshold.icon}</span>
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: threshold.color,
                        }}
                      >
                        {threshold.label}
                      </span>
                      {showValue && (
                        <span className="text-xs text-muted-foreground font-medium">
                          (≥{threshold.value})
                        </span>
                      )}
                    </button>
                  )
                })}

                {/* Custom badges (manual_badge tùy chỉnh) */}
                {customBadges.map((customBadge) => {
                  const isActive = selectedThreshold === customBadge._id

                  return (
                    <button
                      key={customBadge._id}
                      onClick={() => handleThresholdClick(customBadge._id)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md border backdrop-blur-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer hover:scale-105 ${isActive
                        ? "shadow-md scale-105 ring-2 ring-offset-2"
                        : "hover:shadow-sm"
                        }`}
                      style={{
                        backgroundColor: isActive
                          ? `${customBadge.color}30`
                          : `${customBadge.color}10`,
                        borderColor: isActive
                          ? `${customBadge.color}60`
                          : `${customBadge.color}30`,
                        ringColor: isActive ? customBadge.color : undefined,
                      }}
                    >
                      <span className="text-sm">{customBadge.icon}</span>
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: customBadge.color,
                        }}
                      >
                        {customBadge.label}
                      </span>
                      {/* <span className="text-xs text-muted-foreground font-medium">
                        (Tùy chỉnh)
                      </span> */}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Category Tabs - Luôn hiển thị */}
          <div ref={categoryTabsRef} className="mb-8">
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`shrink-0 px-4 md:px-6 py-2 md:py-2.5 rounded-full font-medium transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer ${selectedCategory === null
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/40 scale-105"
                  : "bg-card text-card-foreground hover:bg-muted border border-border hover:scale-105"
                  }`}
              >
                Tất cả
              </button>
              {categories.map((category, index) => (
                <button
                  key={category.id || category._id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`shrink-0 px-4 md:px-6 py-2 md:py-2.5 rounded-full font-medium transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background active:scale-95 cursor-pointer hover:scale-105 ${selectedCategory === category.id
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
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Đang tải sản phẩm...</p>
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
            <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}>
              {filteredFoods.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                  {filteredFoods.map((food, index) => (
                    <div
                      key={food.id}
                      className="menu-item transform transition-all duration-500"
                      style={{
                        animationDelay: `${index * 0.05}s`
                      }}
                    >
                      <MenuCard
                        food={food}
                        onAddToCart={handleAddToCart}
                        onOrderClick={handleOrderClick}
                        isPopular={food.total_quantity > 0}
                        thresholds={thresholds}
                        matchedThreshold={food.matchedThreshold}
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Pagination Controls */}
              {!loading && !error && filteredFoods.length > 0 && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer ${pagination.page === 1
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      : "bg-card text-card-foreground hover:bg-muted border border-border hover:scale-105 active:scale-95"
                      }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Trước</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Show page numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = pagination.page - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer ${pagination.page === pageNum
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/40 scale-105"
                            : "bg-card text-card-foreground hover:bg-muted border border-border hover:scale-105 active:scale-95"
                            }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    <span className="hidden sm:inline">Trang </span>
                    {pagination.page} / {pagination.totalPages}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer ${pagination.page === pagination.totalPages
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      : "bg-card text-card-foreground hover:bg-muted border border-border hover:scale-105 active:scale-95"
                      }`}
                  >
                    <span className="hidden sm:inline">Sau</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!loading && !error && filteredFoods.length === 0 && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <p className="text-muted-foreground text-lg mb-2">
                      {searchQuery
                        ? `Không tìm thấy sản phẩm nào với từ khóa "${searchQuery}"`
                        : selectedCategory
                          ? "Không có sản phẩm nào trong danh mục này"
                          : "Chưa có sản phẩm nào"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={handleCloseToast}
        type={toast.type || "success"}
      />

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

      {/* Cart Component */}
      <Cart
        isOpen={isCartOpen}
        onClose={handleCartClose}
        onCheckout={handleCheckout}
      />

      {/* Auth Modal */}
      <Auth
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />

      {/* User Profile Modal */}
      <UserProfile
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
      />

      {/* Order History Modal */}
      <OrderHistory
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
      />

      {/* Order Form Modal */}
      <OrderForm
        isOpen={isOrderFormOpen}
        onClose={() => setIsOrderFormOpen(false)}
        items={orderFormItems}
        onSuccess={handleOrderSuccess}
      />
    </div>
  )
}


