"use client"

import { useState, useEffect } from "react"
import { useLandingConfig } from "@/hooks/useLandingConfig"
import { ArrowBigDown } from "lucide-react"
import Link from "next/link"

export default function Hero() {
  const { config, loading: configLoading } = useLandingConfig()
  const heroConfig = config?.hero || {}
  const title = heroConfig.title || 'UK Restaurant'
  const subtitle = heroConfig.subtitle || 'Ăn no khỏi "bàn"'
  const description = heroConfig.description || 'Khám phá hương vị đặc biệt với thực đơn đa dạng, nguyên liệu tươi ngon và dịch vụ tận tâm'
  const ctaButtonText = heroConfig.cta_button_text || 'Xem thực đơn'
  const ctaSecondaryButtonText = heroConfig.cta_secondary_button_text || 'Liên hệ'
  const ctaSecondaryButtonLink = heroConfig.cta_secondary_button_link || '/contact'

  const [heroImages, setHeroImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch banners for hero background
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/banners?is_active=true")
        const data = await response.json()
        //console.log("Banners API response:", data)
        if (data.success) {
          if (data.data && data.data.length > 0) {
            //console.log("Setting banners:", data.data)
            setHeroImages(data.data)
          } else {
            //console.log("No banners found, using fallback")
          }
        } else {
          console.error("Banners API error:", data.error)
        }
      } catch (err) {
        console.error("Error fetching banners:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  // Auto-slide images
  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
      }, 5000) // Đổi ảnh mỗi 5 giây

      return () => clearInterval(interval)
    }
  }, [heroImages.length])

  const navigateToMenu = () => {
    window.open('/menu', '_blank')
  }

  const scrollToMenuSection = () => {
    const menuElement = document.getElementById("menu")
    if (menuElement) {
      const offset = 80
      const elementPosition = menuElement.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  // Listen for contact scroll
  const scrollToContact = () => {
    const contactElement = document.getElementById("contact")
    if (contactElement) {
      const offset = 80
      const elementPosition = contactElement.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  if (configLoading) {
    return (
      <section
        id="home"
        className="relative min-h-150 md:min-h-175 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12 overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-background to-primary/5" style={{ zIndex: 0 }}></div>
        <div className="relative z-10 max-w-6xl mx-auto w-full text-center space-y-8 animate-pulse">
          <div className="max-w-4xl mx-auto">
            <div className="h-12 md:h-16 lg:h-20 bg-muted rounded-2xl w-3/4 mx-auto mb-6"></div>
            <div className="h-8 md:h-10 bg-muted rounded-xl w-1/2 mx-auto mb-8"></div>
            <div className="h-4 md:h-6 bg-muted rounded-lg w-2/3 mx-auto mb-4"></div>
            <div className="h-4 md:h-6 bg-muted rounded-lg w-1/2 mx-auto mb-10"></div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="w-full sm:w-40 h-12 bg-muted rounded-xl"></div>
              <div className="w-full sm:w-40 h-12 bg-muted rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="home"
      className="relative min-h-150 md:min-h-175 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12 overflow-hidden cursor-pointer"
      onClick={scrollToMenuSection}
    >
      {/* Background Images Slider */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        {heroImages.length > 0 ? (
          heroImages.map((banner, index) => (
            <div
              key={banner.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              style={{ zIndex: index === currentImageIndex ? 0 : -1 }}
            >
              {banner.image ? (
                <img
                  src={banner.image}
                  alt={banner.title || "Hero background"}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    zIndex: 0,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    console.error("Error loading banner image:", banner.image)
                    e.target.style.display = 'none'
                  }}
                  onLoad={() => {
                    //console.log("Banner image loaded:", banner.image)
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-primary/5"></div>
              )}
            </div>
          ))
        ) : (
          !loading && (
            <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-primary/5"></div>
          )
        )}
      </div>

      {/* Overlay chỉ hiển thị khi có ảnh */}
      {heroImages.length > 0 && (
        <>
          <div className="absolute inset-0 bg-black/5" style={{ zIndex: 1 }}></div>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6), rgba(0,0,0,0.5))`,
              zIndex: 1
            }}
          ></div>
        </>
      )}

      {/* Fallback Gradient Background khi không có ảnh */}
      {heroImages.length === 0 && !loading && (
        <div className="absolute inset-0 bg-linear-to-br from-primary/50 via-background to-primary/30" style={{ zIndex: 0 }}></div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto w-full overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          {/* Title - Adaptive Color */}
          <h1 className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-display mb-4 animate-fade-in-up text-balance drop-shadow-sm ${heroImages.length > 0
            ? 'text-white drop-shadow-lg'
            : 'bg-linear-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent'
            }`}>
            {title}
          </h1>

          {/* Subtitle với Slide-in Animation */}
          <p
            className={`text-xl md:text-2xl lg:text-3xl font-medium font-display mb-6 ${heroImages.length > 0 ? 'text-white drop-shadow-lg' : 'text-primary/80'
              }`}
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.2s both'
            }}
          >
            {subtitle}
          </p>

          {/* Description với Fade-in từ dưới */}
          {/* Description - Adaptive Color */}
          <p
            className={`text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-8 leading-relaxed text-pretty ${heroImages.length > 0 ? 'text-white/90 drop-shadow-md' : 'text-muted-foreground'
              }`}
            style={{
              animation: 'fadeInUp 1s ease-out 0.4s both'
            }}
          >
            {description}
          </p>

          {/* CTA Buttons với Glassmorphism */}
          <div className="flex flex-col py-3 sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up animation-delay-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollToMenuSection();
              }}
              className="group relative w-full sm:w-auto px-8 py-3 md:px-10 md:py-4 cursor-pointer bg-primary hover:bg-primary-dark text-primary-foreground font-bold text-base md:text-lg lg:text-xl rounded-xl shadow-md hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-transparent whitespace-nowrap overflow-hidden"
            >
              <span className="relative z-10">{ctaButtonText}</span>
              <span
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
              ></span>
            </button>
            <Link
              href={ctaSecondaryButtonLink}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={`group relative w-full sm:w-auto px-8 py-3 md:px-10 md:py-4 cursor-pointer font-bold text-center text-base md:text-lg lg:text-xl rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg whitespace-nowrap overflow-hidden ${heroImages.length > 0
                ? 'bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-white/60 hover:border-white focus:ring-white/30'
                : 'bg-background hover:bg-muted text-foreground border-2 border-border hover:border-primary/50 focus:ring-primary/20'
                }`}
              style={{
                backdropFilter: heroImages.length > 0 ? 'blur(10px) saturate(180%)' : 'none',
                display: 'inline-block'
              }}
            >
              <span className="relative z-10">{ctaSecondaryButtonText}</span>
              {heroImages.length > 0 && (
                <span
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                ></span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Adaptive Color */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          scrollToMenuSection();
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer hover:opacity-80 transition-opacity"
        aria-label="Cuộn xuống menu"
        style={{ zIndex: 20 }}
      >
        <div className={`flex flex-col items-center gap-2 ${heroImages.length > 0 ? 'text-white drop-shadow-lg' : 'text-primary'}`}>
          <span className="text-sm font-medium scroll-indicator-arrow">Cuộn xuống</span>
          <div className="relative">
            <ArrowBigDown className="w-8 h-8 scroll-indicator-arrow" />
            <div className={`absolute inset-0 rounded-full blur-md scroll-indicator-glow ${heroImages.length > 0 ? 'bg-white/30' : 'bg-primary/20'}`}></div>
          </div>
        </div>
      </button>

      {/* Image Indicators (dots) */}
      {
        heroImages.length > 1 && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${index === currentImageIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
                  }`}
                aria-label={`Chuyển đến ảnh ${index + 1}`}
              />
            ))}
          </div>
        )
      }
    </section >
  )
}

