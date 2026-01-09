"use client"

import { useState, useEffect, useRef } from "react"
import { 
  CheckCircle2, 
  Zap, 
  Heart, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Users, 
  Shield,
  Clock,
  ChefHat,
  Leaf,
  Star,
  ArrowDown,
} from "lucide-react"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { useLandingConfig } from "@/hooks/useLandingConfig"

// Helper function để convert icon string thành component
const getIconComponent = (icon) => {
  if (typeof icon === 'string') {
    // Nếu là string, tìm component tương ứng
    const iconMap = {
      'Users': Users,
      'Star': Star,
      'Clock': Clock,
      'Award': Award,
      'Leaf': Leaf,
      'ChefHat': ChefHat,
      'Zap': Zap,
      'Shield': Shield,
      'Heart': Heart,
    }
    return iconMap[icon] || Users // Fallback về Users nếu không tìm thấy
  }
  // Nếu đã là component, trả về luôn
  return icon || Users
}

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
    <div className="flex justify-center mt-8 md:mt-12 pb-4">
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

// Component để animate số đếm tăng dần
function AnimatedNumber({ value, isVisible, duration = 2000 }) {
  const [displayValue, setDisplayValue] = useState("0")
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return

    // Parse giá trị từ string
    const parseValue = (val) => {
      // Xử lý các format khác nhau: "10,000+", "4.9/5", "30'", "15+"
      if (val.includes("/")) {
        // Format: "4.9/5"
        const num = parseFloat(val.split("/")[0])
        const suffix = "/" + val.split("/")[1]
        return { target: num, suffix, isDecimal: true }
      } else if (val.includes("'")) {
        // Format: "30'"
        const num = parseInt(val.replace("'", ""))
        return { target: num, suffix: "'", isDecimal: false }
      } else if (val.includes("+")) {
        // Format: "10,000+" hoặc "15+"
        const numStr = val.replace(/,/g, "").replace("+", "")
        const num = parseInt(numStr)
        return { target: num, suffix: "+", isDecimal: false, hasComma: val.includes(",") }
      } else {
        // Format số thường
        const num = parseFloat(val)
        return { target: num, suffix: "", isDecimal: !Number.isInteger(num) }
      }
    }

    const { target, suffix, isDecimal, hasComma } = parseValue(value)
    const startTime = Date.now()
    hasAnimated.current = true

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      let current = target * easeOut
      
      if (isDecimal) {
        current = Math.round(current * 10) / 10
      } else {
        current = Math.round(current)
      }

      // Format số với comma nếu cần
      let formatted = current.toString()
      if (hasComma && current >= 1000) {
        formatted = current.toLocaleString('vi-VN')
      }

      setDisplayValue(formatted + suffix)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Đảm bảo hiển thị giá trị cuối cùng chính xác
        let final = target
        if (isDecimal) {
          final = Math.round(target * 10) / 10
        } else {
          final = Math.round(target)
        }
        let finalFormatted = final.toString()
        if (hasComma && final >= 1000) {
          finalFormatted = final.toLocaleString('vi-VN')
        }
        setDisplayValue(finalFormatted + suffix)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, value, duration])

  return <span>{displayValue}</span>
}

export default function WhyChooseUs() {
  const [headerRef, isHeaderVisible] = useScrollAnimation({ threshold: 0.2 })
  const [statsRef, isStatsVisible] = useScrollAnimation({ threshold: 0.2 })
  const { config } = useLandingConfig()
  const [reviewStats, setReviewStats] = useState(null)

  // Fetch review stats nếu auto_calculate_stats = true
  useEffect(() => {
    const fetchReviewStats = async () => {
      if (config?.whyChooseUs?.auto_calculate_stats) {
        try {
          const res = await fetch('/api/reviews/stats')
          const data = await res.json()
          if (data.success) {
            setReviewStats(data.data)
          }
        } catch (error) {
          console.error('Error fetching review stats:', error)
        }
      }
    }
    fetchReviewStats()
  }, [config?.whyChooseUs?.auto_calculate_stats])

  // Lấy features từ config hoặc dùng default
  const configFeatures = config?.whyChooseUs?.features || []
  
  // Tạo refs động cho từng feature (tối đa 6)
  const [card1Ref, isCard1Visible] = useScrollAnimation({ threshold: 0.2 })
  const [card2Ref, isCard2Visible] = useScrollAnimation({ threshold: 0.2 })
  const [card3Ref, isCard3Visible] = useScrollAnimation({ threshold: 0.2 })
  const [card4Ref, isCard4Visible] = useScrollAnimation({ threshold: 0.2 })
  const [card5Ref, isCard5Visible] = useScrollAnimation({ threshold: 0.2 })
  const [card6Ref, isCard6Visible] = useScrollAnimation({ threshold: 0.2 })
  
  const featureRefs = [card1Ref, card2Ref, card3Ref, card4Ref, card5Ref, card6Ref]
  const featureVisibles = [isCard1Visible, isCard2Visible, isCard3Visible, isCard4Visible, isCard5Visible, isCard6Visible]
  
  // Check initial visibility cho feature cards - hiển thị ngay nếu đã trong viewport
  useEffect(() => {
    const checkInitialVisibility = () => {
      featureRefs.forEach((ref) => {
        if (ref.current) {
          const el = ref.current
          const rect = el.getBoundingClientRect()
          const windowHeight = window.innerHeight
          const windowWidth = window.innerWidth
          
          // Kiểm tra xem element có trong viewport không
          const isInViewport = (
            rect.top < windowHeight &&
            rect.bottom > 0 &&
            rect.left < windowWidth &&
            rect.right > 0 &&
            rect.height > 0 &&
            rect.width > 0
          )
          
          // Nếu đã trong viewport, thêm class visible ngay
          if (isInViewport && !el.classList.contains('visible')) {
            el.classList.add('visible')
          }
        }
      })
    }
    
    // Check sau khi DOM render
    const timeoutId = setTimeout(checkInitialVisibility, 0)
    const rafId1 = requestAnimationFrame(() => {
      checkInitialVisibility()
      const rafId2 = requestAnimationFrame(() => {
        checkInitialVisibility()
      })
      return () => cancelAnimationFrame(rafId2)
    })
    
    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(rafId1)
    }
  }, [configFeatures.length]) // Re-check khi features thay đổi
  
  // Features data - Sử dụng từ config, sắp xếp theo order
  const features = configFeatures
    .map((feature, index) => {
      const ref = featureRefs[index] || null
      const isVisible = featureVisibles[index] || false
      const IconComponent = getIconComponent(feature.icon)
      
      return {
        icon: IconComponent,
        title: feature.title,
        description: feature.description,
        color: feature.color || "from-primary/20 to-primary-light/10",
        borderColor: feature.borderColor || "border-primary/30",
        order: feature.order || index + 1,
        ref,
        isVisible,
      }
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  // Stats data - Số liệu ấn tượng với giá trị gốc để animate
  // Sử dụng stats từ reviews nếu auto_calculate_stats = true, ngược lại dùng từ config hoặc default
  const defaultStats = [
    { 
      icon: Users, 
      value: "10,000+", 
      label: "Khách hàng tin tưởng", 
      color: "from-blue-500/20 to-blue-600/10",
    },
    { 
      icon: Star, 
      value: "4.9/5", 
      label: "Đánh giá trung bình", 
      color: "from-yellow-500/20 to-yellow-600/10",
    },
    { 
      icon: Clock, 
      value: "30'", 
      label: "Giao hàng nhanh", 
      color: "from-green-500/20 to-green-600/10",
    },
    { 
      icon: Award, 
      value: "15+", 
      label: "Năm kinh nghiệm", 
      color: "from-primary/20 to-primary-light/10",
    },
  ]

  // Nếu auto_calculate_stats = true và có reviewStats, cập nhật stats từ reviews
  let stats = config?.whyChooseUs?.stats || defaultStats
  
  // Convert icon strings thành components nếu cần
  stats = stats.map(stat => ({
    ...stat,
    icon: getIconComponent(stat.icon)
  }))
  
  if (config?.whyChooseUs?.auto_calculate_stats && reviewStats) {
    stats = stats.map(stat => {
      // So sánh bằng tên icon (string) hoặc component
      const iconName = typeof stat.icon === 'string' ? stat.icon : stat.icon.name || ''
      if (iconName === 'Users' || stat.icon === Users) {
        return { ...stat, value: `${reviewStats.totalReviews.toLocaleString('vi-VN')}+` }
      }
      if (iconName === 'Star' || stat.icon === Star) {
        return { ...stat, value: `${reviewStats.averageRating}/5` }
      }
      return stat
    })
  }

  return (
    <section id="why-choose-us" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-background via-muted/20 to-background"></div>
      
      {/* Decorative grid pattern - Ẩn trên mobile để tối ưu */}
      <div className="hidden md:block absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Animated orbs - Nhỏ hơn trên mobile */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 md:w-96 md:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 md:w-96 md:h-96 bg-primary-light/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Visual Cue - Nhỏ hơn trên mobile */}
      <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-muted/50 blur-3xl transform translate-y-1/2 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10 overflow-hidden">
        {/* Section Header - Compact hơn cho mobile */}
        <div
          ref={headerRef}
          className={`text-center mb-10 sm:mb-12 md:mb-16 scroll-fade-in ${isHeaderVisible ? "visible" : ""}`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 mb-3 sm:mb-4 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-sm">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-widest">
              Ưu điểm vượt trội
            </span>
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Title - Responsive sizes */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black font-display mb-4 sm:mb-6 leading-tight px-2">
            <span className="block bg-linear-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              {config?.whyChooseUs?.section_title || "Tại sao chọn chúng tôi"}
            </span>
          </h2>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="h-px w-8 sm:w-12 bg-linear-to-r from-transparent to-primary"></div>
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary"></div>
            <div className="h-px w-8 sm:w-12 bg-linear-to-r from-primary to-transparent"></div>
          </div>

          {/* Description - Compact hơn */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light px-2">
            {config?.whyChooseUs?.section_description || "Khám phá những lý do khiến chúng tôi trở thành lựa chọn hàng đầu của hàng nghìn khách hàng"}
          </p>
        </div>

        {/* Stats Bar - Compact cho mobile */}
        <div
          ref={statsRef}
          className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-10 sm:mb-12 md:mb-16 scroll-fade-in ${isStatsVisible ? "visible" : ""}`}
        >
          {stats.map((stat, index) => {
            const IconComponent = getIconComponent(stat.icon)
            return (
              <div
                key={index}
                className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-5 md:p-6"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${stat.color} rounded-xl opacity-30`}></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-2 sm:mb-3 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-foreground mb-1 sm:mb-1.5">
                    <AnimatedNumber value={stat.value} isVisible={isStatsVisible} duration={2000} />
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium leading-tight px-1">
                    {stat.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Feature Cards - Compact cho mobile, không hover */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            
            return (
              <div
                key={index}
                ref={feature.ref}
                className={`relative scroll-fade-in ${
                  index === 0 ? "scroll-delay-100" : 
                  index === 1 ? "scroll-delay-200" : 
                  index === 2 ? "scroll-delay-300" :
                  index === 3 ? "scroll-delay-100" :
                  index === 4 ? "scroll-delay-200" : "scroll-delay-300"
                } ${feature.isVisible ? "visible" : ""}`}
              >
                <div className={`
                  relative bg-card/90 backdrop-blur-md border-2 ${feature.borderColor} rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7
                  h-full flex flex-col
                `}>
                  {/* Gradient overlay - Static */}
                  <div className={`absolute inset-0 bg-linear-to-br ${feature.color} rounded-xl sm:rounded-2xl opacity-20`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex-1 flex flex-col">
                    {/* Icon Section - Compact hơn */}
                    <div className="relative mb-4 sm:mb-5">
                      {/* Glow effect - Static */}
                      <div className="absolute inset-0 rounded-xl sm:rounded-2xl"></div>
                      
                      {/* Icon container */}
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 bg-linear-to-br from-primary/20 via-primary/10 to-primary-light/10 rounded-lg sm:rounded-xl flex items-center justify-center text-primary shadow-lg shadow-primary/10 border-2 border-primary/20">
                        <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9" />
                      </div>
                      
                      {/* Decorative dots - Static animation */}
                      <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full animate-ping"></div>
                      <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-light rounded-full animate-pulse"></div>
                    </div>

                    {/* Number badge - Nhỏ hơn */}
                    <div className="mb-2 sm:mb-3">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black text-primary/25 leading-none">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Title - Compact */}
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-foreground mb-2 sm:mb-3">
                      {feature.title}
                    </h3>

                    {/* Description - Font size nhỏ hơn cho mobile */}
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed flex-1">
                      {feature.description}
                    </p>

                    {/* Decorative line - Static */}
                    <div className="mt-4 sm:mt-5 h-0.5 w-10 sm:w-12 bg-linear-to-r from-primary to-transparent"></div>
                  </div>

                  {/* Corner accents - Static, nhỏ hơn */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-primary/20 rounded-tr-xl sm:rounded-tr-2xl"></div>
                  <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-primary/20 rounded-bl-xl sm:rounded-bl-2xl"></div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Subtle Scroll Indicator - Cuộn xuống Testimonials */}
        <ScrollToNextSection targetId="testimonials" />
      </div>
    </section>
  )
}
