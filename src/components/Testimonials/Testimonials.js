"use client"

import { useState, useEffect, useRef } from "react"
import { Star, Quote, CheckCircle2, Sparkles, TrendingUp, MessageSquare } from "lucide-react"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { useLandingConfig } from "@/hooks/useLandingConfig"

// Component để animate số đếm tăng dần
function AnimatedNumber({ value, isVisible, duration = 2000, suffix = "" }) {
  const [displayValue, setDisplayValue] = useState("0")
  const hasAnimated = useRef(false)
  const lastValue = useRef(value)

  useEffect(() => {
    // Reset animation nếu value thay đổi
    if (lastValue.current !== value) {
      hasAnimated.current = false
      lastValue.current = value
    }

    if (!isVisible || hasAnimated.current) {
      // Nếu đã animate rồi nhưng value thay đổi, cập nhật ngay
      if (lastValue.current !== value) {
        // Kiểm tra xem value có phải là text không (như "1000+", "11k")
        const isTextValue = typeof value === 'string' && !/^-?\d+(\.\d+)?$/.test(value.trim())
        if (isTextValue) {
          setDisplayValue(value + suffix)
        } else {
          const numValue = typeof value === 'number' ? value : parseFloat(value) || 0
          const isDecimal = !Number.isInteger(numValue)
          let formatted = numValue.toString()
          if (numValue >= 1000) {
            formatted = numValue.toLocaleString('vi-VN', {
              minimumFractionDigits: isDecimal ? 1 : 0,
              maximumFractionDigits: isDecimal ? 1 : 0
            })
          } else if (isDecimal) {
            formatted = numValue.toFixed(1)
          }
          setDisplayValue(formatted + suffix)
        }
        hasAnimated.current = true
      }
      return
    }

    // Kiểm tra xem value có phải là text không (như "1000+", "11k")
    const isTextValue = typeof value === 'string' && !/^-?\d+(\.\d+)?$/.test(value.trim())
    
    // Nếu là text, hiển thị trực tiếp không animate
    if (isTextValue) {
      setDisplayValue(value + suffix)
      hasAnimated.current = true
      return
    }

    // Nếu là số, animate như bình thường
    const target = typeof value === 'number' ? value : parseFloat(value) || 0
    const isDecimal = !Number.isInteger(target)
    const startTime = Date.now()
    hasAnimated.current = true

    // Xác định số chữ số thập phân cần hiển thị
    const getDecimalPlaces = (num) => {
      if (Number.isInteger(num)) return 0
      const str = num.toString()
      if (str.includes('.')) {
        return str.split('.')[1].length
      }
      return 0
    }
    const decimalPlaces = getDecimalPlaces(target)

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      let current = target * easeOut
      
      // Format với số chữ số thập phân chính xác
      if (isDecimal && decimalPlaces > 0) {
        current = Math.round(current * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
      } else {
        current = Math.round(current)
      }

      // Format số với comma nếu >= 1000
      let formatted = current.toString()
      if (current >= 1000) {
        formatted = current.toLocaleString('vi-VN', {
          minimumFractionDigits: isDecimal ? decimalPlaces : 0,
          maximumFractionDigits: isDecimal ? decimalPlaces : 0
        })
      } else if (isDecimal && decimalPlaces > 0) {
        formatted = current.toFixed(decimalPlaces)
      }

      setDisplayValue(formatted + suffix)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Đảm bảo hiển thị giá trị cuối cùng chính xác
        let final = target
        if (isDecimal && decimalPlaces > 0) {
          final = Math.round(target * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
        } else {
          final = Math.round(target)
        }
        let finalFormatted = final.toString()
        if (final >= 1000) {
          finalFormatted = final.toLocaleString('vi-VN', {
            minimumFractionDigits: isDecimal ? decimalPlaces : 0,
            maximumFractionDigits: isDecimal ? decimalPlaces : 0
          })
        } else if (isDecimal && decimalPlaces > 0) {
          finalFormatted = final.toFixed(decimalPlaces)
        }
        setDisplayValue(finalFormatted + suffix)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, value, duration, suffix])

  return <span>{displayValue}</span>
}

export default function Testimonials({ onReviewFormClick }) {
  const [headerRef, isHeaderVisible] = useScrollAnimation({ threshold: 0.2 })
  const carouselContainerRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const autoScrollIntervalRef = useRef(null)

  const { config, loading: loadingConfig } = useLandingConfig()
  const [reviewStats, setReviewStats] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)

  // Fetch reviews từ API (chỉ lấy reviews đã được duyệt)
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true)
        // Lấy reviews đã được duyệt và visible
        const res = await fetch('/api/reviews?approved=true&visible=true&limit=20')
        const data = await res.json()
        if (data.success) {
          setReviews(data.data)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoadingReviews(false)
      }
    }
    fetchReviews()
  }, [])

  // Fetch review stats nếu auto_calculate_stats = true
  useEffect(() => {
    const fetchReviewStats = async () => {
      if (config?.testimonials?.auto_calculate_stats) {
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
  }, [config?.testimonials?.auto_calculate_stats])

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hôm nay'
    if (diffDays === 1) return 'Hôm qua'
    if (diffDays < 7) return `${diffDays} ngày trước`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`
    return `${Math.floor(diffDays / 365)} năm trước`
  }

  // Trust stats - Social proof mạnh mẽ
  // Chỉ sử dụng giá trị từ config khi đã load xong, không dùng default ngay
  const defaultTrustStats = {
    averageRating: 4.9,
    totalReviews: 1247,
    verifiedCustomers: 98
  }

  // Chỉ dùng default khi config chưa load xong, sau đó dùng từ config
  let trustStats = null
  if (loadingConfig) {
    // Đang load, chưa hiển thị gì hoặc hiển thị loading
    trustStats = null
  } else if (config?.testimonials?.auto_calculate_stats && reviewStats) {
    // Tự động tính từ reviews
    trustStats = {
      averageRating: reviewStats.averageRating,
      totalReviews: reviewStats.totalReviews,
      verifiedCustomers: reviewStats.verifiedCustomers,
    }
  } else if (config?.testimonials?.trustStats) {
    // Dùng từ config
    trustStats = config.testimonials.trustStats
  } else {
    // Fallback về default nếu không có config
    trustStats = defaultTrustStats
  }

  // Sử dụng reviews từ API hoặc testimonials từ config
  const configTestimonials = config?.testimonials?.testimonials || []
  const displayReviews = reviews.length > 0 
    ? reviews.map((review, index) => ({
        name: review.customer_name || 'Khách hàng',
        role: review.customer_phone ? `SĐT: ${review.customer_phone}` : 'Khách hàng',
        rating: review.rating || 5,
        comment: review.comment || '',
        avatar: review.avatar || '👤',
        color: review.color || 'from-primary/20 to-primary-light/10',
        borderColor: review.borderColor || 'border-primary/30',
        date: formatDate(review.created_at),
        _id: review._id,
      }))
    : configTestimonials.map((t, index) => ({
        ...t,
        date: t.date || '',
      }))

  // Auto scroll carousel
  useEffect(() => {
    if (displayReviews.length > 3) {
      autoScrollIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = Math.max(0, displayReviews.length - 3)
          return prev >= maxIndex ? 0 : prev + 1
        })
      }, 5000) // Chuyển mỗi 5 giây

      return () => {
        if (autoScrollIntervalRef.current) {
          clearInterval(autoScrollIntervalRef.current)
        }
      }
    }
  }, [displayReviews.length])


  // Section title và description từ config
  const sectionTitle = config?.testimonials?.section_title || 'Đánh giá từ khách hàng'
  const sectionDescription = config?.testimonials?.section_description || 'Những phản hồi chân thật từ khách hàng đã sử dụng dịch vụ của chúng tôi'

  return (
    <section id="testimonials" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-primary-light/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto overflow-hidden relative z-10">
        {/* Section Header - Enhanced với trust indicators */}
        <div
          ref={headerRef}
          className={`text-center mb-10 sm:mb-12 md:mb-16 scroll-fade-in ${isHeaderVisible ? "visible" : ""}`}
        >
          {/* Badge với sparkles */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm md:text-base font-semibold text-primary uppercase tracking-wider">
              Phản hồi khách hàng
            </span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display text-foreground mb-4 sm:mb-6 px-2">
            {sectionTitle}
          </h2>

          {/* Divider */}
          {/* Divider */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="h-px w-8 sm:w-12 bg-linear-to-r from-transparent to-primary"></div>
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary"></div>
            <div className="h-px w-8 sm:w-12 bg-linear-to-r from-primary to-transparent"></div>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2 mb-6 sm:mb-8">
            {sectionDescription}
          </p>

          {/* Trust Stats Bar - Social proof mạnh mẽ */}
          {trustStats && (
            <div
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8"
            >
              {/* Average Rating */}
              <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl sm:text-2xl font-black text-foreground">
                    <AnimatedNumber value={trustStats.averageRating} isVisible={true} duration={2000} />
                  </span>
                </div>
                <div className="h-6 w-px bg-border/50"></div>
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">Đánh giá trung bình</span>
              </div>

              {/* Total Reviews */}
              <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  <AnimatedNumber value={trustStats.totalReviews} isVisible={true} duration={2000} />
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">Đánh giá</span>
              </div>

              {/* Verified Customers */}
              <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  <AnimatedNumber value={trustStats.verifiedCustomers} isVisible={true} duration={2000} suffix="%" />
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">Đã xác minh</span>
              </div>
            </div>
          )}
        </div>

        {/* Testimonials Carousel - Auto scroll */}
        {loadingReviews ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Đang tải đánh giá...</div>
          </div>
        ) : displayReviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div 
            ref={carouselContainerRef}
            className="relative overflow-hidden"
            onMouseEnter={() => {
              if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current)
              }
            }}
            onMouseLeave={() => {
              if (displayReviews.length > 3) {
                autoScrollIntervalRef.current = setInterval(() => {
                  setCurrentIndex((prev) => {
                    const maxIndex = Math.max(0, displayReviews.length - 3)
                    return prev >= maxIndex ? 0 : prev + 1
                  })
                }, 5000)
              }
            }}
          >
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out gap-4 sm:gap-5 md:gap-6 lg:gap-8"
                style={{ 
                  transform: `translateX(calc(-${currentIndex} * (100% / 3)))`,
                }}
              >
                {displayReviews.map((testimonial, index) => (
                  <div
                    key={testimonial._id || index}
                    className="shrink-0"
                    style={{ width: '33.333%' }}
                  >
                  <div className={`
                    relative bg-card border-2 ${testimonial.borderColor} rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 lg:p-8
                    h-full flex flex-col
                  `}>
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-linear-to-br ${testimonial.color} rounded-xl sm:rounded-2xl opacity-20`}></div>

                <div className="relative z-10 flex-1 flex flex-col">
                  {/* Quote Icon */}
                  <div className="mb-3 sm:mb-4 flex items-start">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md"></div>
                      <Quote className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-primary" />
                    </div>
                  </div>

                  {/* Rating với số điểm */}
                  <div className="flex items-center gap-2 mb-4 sm:mb-5">
                    <div className="flex items-center gap-0.5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400 drop-shadow-sm"
                        />
                      ))}
                    </div>
                    <span className="text-sm sm:text-base font-black text-foreground">{testimonial.rating}.0</span>
                  </div>

                  {/* Comment - Better typography */}
                  <p className="text-foreground leading-relaxed mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base md:text-lg font-medium flex-1">
                    "{testimonial.comment}"
                  </p>

                  {/* Author Section - Enhanced */}
                  <div className="mt-auto pt-4 sm:pt-5 md:pt-6 border-t-2 border-border/50">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Avatar */}
                      <div className={`relative w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-linear-to-br ${testimonial.color} flex items-center justify-center text-2xl sm:text-3xl shadow-lg shrink-0`}>
                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-sm"></div>
                        <span className="relative z-10">{testimonial.avatar}</span>
                      </div>

                      {/* Author Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                          <h4 className="font-bold text-base sm:text-lg text-card-foreground truncate">{testimonial.name}</h4>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate mb-1">{testimonial.role}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground/70">{testimonial.date}</p>
                      </div>
                    </div>
                  </div>
                </div>

                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-primary/5 rounded-bl-full opacity-30"></div>
                  </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation dots */}
            {displayReviews.length > 3 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({ length: Math.max(1, displayReviews.length - 2) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentIndex === index 
                        ? 'bg-primary w-8' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`Đi đến slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Call to action - Enhanced */}
        <div className="mt-8 sm:mt-10 md:mt-12 text-center px-2">
          <button
            onClick={() => onReviewFormClick && onReviewFormClick()}
            className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 py-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card/70 hover:border-primary/30 transition-all cursor-pointer active:scale-95"
          >
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
              Bạn cũng muốn chia sẻ trải nghiệm của mình?
            </p>
            <span className="text-primary font-bold text-sm sm:text-base flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              Để lại đánh giá
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </span>
          </button>
        </div>

      </div>
    </section>
  )
}
