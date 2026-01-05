"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useLandingConfig } from "@/hooks/useLandingConfig"

export default function Hero() {
  const { config } = useLandingConfig()
  const heroConfig = config?.hero || {}
  const title = heroConfig.title || 'UK Restaurant'
  const subtitle = heroConfig.subtitle || 'Ăn no khỏi "bàn"'
  const description = heroConfig.description || 'Khám phá hương vị đặc biệt với thực đơn đa dạng, nguyên liệu tươi ngon và dịch vụ tận tâm'
  const ctaButtonText = heroConfig.cta_button_text || 'Xem thực đơn'
  
  const [heroImages, setHeroImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch banners for hero background
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/banners?is_active=true")
        const data = await response.json()
        console.log("Banners API response:", data)
        if (data.success) {
          if (data.data && data.data.length > 0) {
            console.log("Setting banners:", data.data)
            setHeroImages(data.data)
          } else {
            console.log("No banners found, using fallback")
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

  const scrollToMenu = () => {
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

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background Images Slider */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        {heroImages.length > 0 ? (
          heroImages.map((banner, index) => (
            <div
              key={banner.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
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
                    console.log("Banner image loaded:", banner.image)
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

      {/* Overlay để text dễ đọc */}
      <div className="absolute inset-0 bg-black/5" style={{ zIndex: 1 }}></div>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6), rgba(0,0,0,0.5))`,
          zIndex: 1
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-display text-white mb-4 animate-fade-in-up text-balance drop-shadow-lg">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl font-medium font-display text-white mb-6 animate-fade-in-up animation-delay-100 drop-shadow-md">
            {subtitle}
          </p>

          {/* Description */}
          <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in-up animation-delay-200 text-pretty drop-shadow-md">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col py-3 sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up animation-delay-300">
            <button
              onClick={scrollToMenu}
              className="w-full sm:w-auto px-8 py-3 md:px-10 md:py-4 cursor-pointer bg-primary hover:bg-primary-dark text-primary-foreground font-bold text-base md:text-lg lg:text-xl rounded-xl shadow-md hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-transparent whitespace-nowrap"
            >
              {ctaButtonText}
            </button>
            <button
              onClick={scrollToContact}
              className="w-full sm:w-auto px-8 py-3 md:px-10 md:py-4 cursor-pointer bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/50 hover:border-white font-bold text-base md:text-lg lg:text-xl rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg whitespace-nowrap"
            >
              Liên hệ
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToMenu}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce cursor-pointer hover:opacity-80 transition-opacity"
        aria-label="Cuộn xuống menu"
      >
        <div className="flex flex-col items-center gap-2 text-white/80">
          <span className="text-sm font-medium">Cuộn xuống</span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </button>

      {/* Image Indicators (dots) */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentImageIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Chuyển đến ảnh ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

