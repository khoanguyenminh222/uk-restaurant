"use client"

import { useState, useEffect, useRef } from "react"
import { Star, Quote, CheckCircle2, Sparkles, TrendingUp } from "lucide-react"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"

// Component để animate số đếm tăng dần
function AnimatedNumber({ value, isVisible, duration = 2000, suffix = "" }) {
  const [displayValue, setDisplayValue] = useState("0")
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return

    const target = typeof value === 'number' ? value : parseFloat(value)
    const isDecimal = !Number.isInteger(target)
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

      // Format số với comma nếu >= 1000
      let formatted = current.toString()
      if (current >= 1000) {
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
        if (final >= 1000) {
          finalFormatted = final.toLocaleString('vi-VN')
        }
        setDisplayValue(finalFormatted + suffix)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, value, duration, suffix])

  return <span>{displayValue}</span>
}

export default function Testimonials() {
  const sectionTitle = 'Đánh giá từ khách hàng'
  const sectionDescription = 'Những phản hồi chân thật từ khách hàng đã sử dụng dịch vụ của chúng tôi'
  
  const [headerRef, isHeaderVisible] = useScrollAnimation({ threshold: 0.2 })
  const [statsRef, isStatsVisible] = useScrollAnimation({ threshold: 0.2 })
  const [testimonial1Ref, isTestimonial1Visible] = useScrollAnimation({ threshold: 0.2 })
  const [testimonial2Ref, isTestimonial2Visible] = useScrollAnimation({ threshold: 0.2 })
  const [testimonial3Ref, isTestimonial3Visible] = useScrollAnimation({ threshold: 0.2 })

  // Trust stats - Social proof mạnh mẽ
  const trustStats = {
    averageRating: 4.9,
    totalReviews: 1247,
    verifiedCustomers: 98
  }

  // Sample testimonials với thông tin đa dạng và trust signals
  const testimonials = [
    {
      name: "Nguyễn Văn A",
      role: "Khách hàng thân thiết",
      rating: 5,
      comment: "Món ăn rất ngon, giao hàng nhanh chóng. Nhà hàng luôn đảm bảo chất lượng và dịch vụ tận tâm. Tôi sẽ quay lại đặt món nhiều lần nữa!",
      avatar: "👨‍💼",
      color: "from-blue-500/20 to-blue-600/10",
      borderColor: "border-blue-500/30",
      verified: true,
      date: "2 tuần trước",
      ref: testimonial1Ref,
      isVisible: isTestimonial1Visible,
    },
    {
      name: "Trần Thị B",
      role: "Khách hàng mới",
      rating: 5,
      comment: "Lần đầu tiên đặt món và tôi rất hài lòng. Thực đơn đa dạng, giá cả hợp lý. Đặc biệt là món phở bò rất ngon và đậm đà!",
      avatar: "👩‍💼",
      color: "from-pink-500/20 to-pink-600/10",
      borderColor: "border-pink-500/30",
      verified: true,
      date: "1 tuần trước",
      ref: testimonial2Ref,
      isVisible: isTestimonial2Visible,
    },
    {
      name: "Lê Văn C",
      role: "Food Blogger",
      rating: 5,
      comment: "Chất lượng món ăn vượt ngoài mong đợi. Nguyên liệu tươi ngon, cách chế biến cẩn thận. Đây là một trong những nhà hàng tốt nhất mà tôi từng thử!",
      avatar: "👨‍🍳",
      color: "from-primary/20 to-primary-light/10",
      borderColor: "border-primary/30",
      verified: true,
      date: "3 ngày trước",
      ref: testimonial3Ref,
      isVisible: isTestimonial3Visible,
    },
  ]

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
          <div className="w-16 sm:w-20 md:w-24 h-1 sm:h-1.5 bg-linear-to-r from-transparent via-primary to-transparent mx-auto mb-4 sm:mb-6 rounded-full"></div>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2 mb-6 sm:mb-8">
            {sectionDescription}
          </p>

          {/* Trust Stats Bar - Social proof mạnh mẽ */}
          <div
            ref={statsRef}
            className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 scroll-fade-in ${isStatsVisible ? "visible" : ""}`}
          >
            {/* Average Rating */}
            <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  <AnimatedNumber value={trustStats.averageRating} isVisible={isStatsVisible} duration={2000} />
                </span>
              </div>
              <div className="h-6 w-px bg-border/50"></div>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Đánh giá trung bình</span>
            </div>

            {/* Total Reviews */}
            <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-xl sm:text-2xl font-black text-foreground">
                <AnimatedNumber value={trustStats.totalReviews} isVisible={isStatsVisible} duration={2000} />
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Đánh giá</span>
            </div>

            {/* Verified Customers */}
            <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-xl sm:text-2xl font-black text-foreground">
                <AnimatedNumber value={trustStats.verifiedCustomers} isVisible={isStatsVisible} duration={2000} suffix="%" />
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Đã xác minh</span>
            </div>
          </div>
        </div>

        {/* Testimonials Grid - Enhanced design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={testimonial.ref}
              className={`relative scroll-fade-in ${
                index === 0 ? "scroll-delay-100" : index === 1 ? "scroll-delay-200" : "scroll-delay-300"
              } ${testimonial.isVisible ? "visible" : ""}`}
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
                    {testimonial.verified && (
                      <div className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-semibold text-primary">Đã xác minh</span>
                      </div>
                    )}
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
                        {testimonial.verified && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full border-2 border-card flex items-center justify-center">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white fill-white" />
                          </div>
                        )}
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

        {/* Call to action - Enhanced */}
        <div className="mt-8 sm:mt-10 md:mt-12 text-center px-2">
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 py-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl">
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
              Bạn cũng muốn chia sẻ trải nghiệm của mình?
            </p>
            <span className="text-primary font-bold text-sm sm:text-base cursor-pointer hover:underline flex items-center gap-1">
              Để lại đánh giá
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
