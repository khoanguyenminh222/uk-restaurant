"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Header from "@/components/Header/Header"
import Footer from "@/components/Footer/Footer"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { useContactConfig } from "@/hooks/useContactConfig"
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Clock,
  Send,
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles
} from "lucide-react"
import * as lucideIcons from "lucide-react"

// Facebook SVG Icon
const FacebookIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
      clipRule="evenodd"
    />
  </svg>
)

// Instagram SVG Icon
const InstagramIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058z"
      clipRule="evenodd"
    />
    <path d="M12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
  </svg>
)

// Helper function để lấy icon component
const getIconComponent = (iconName) => {
  if (!iconName || typeof iconName !== 'string') return MessageCircle
  try {
    if (iconName === 'FacebookIcon') return FacebookIcon
    if (iconName === 'InstagramIcon') return InstagramIcon
    const Icon = lucideIcons[iconName]
    return Icon || MessageCircle
  } catch {
    return MessageCircle
  }
}

// Component để animate số đếm tăng dần
function AnimatedNumber({ value, isVisible, duration = 2000, suffix = "" }) {
  const [displayValue, setDisplayValue] = useState("0")
  const hasAnimated = useRef(false)
  const lastValue = useRef(value)

  useEffect(() => {
    if (lastValue.current !== value) {
      hasAnimated.current = false
      lastValue.current = value
    }

    if (!isVisible || hasAnimated.current) {
      if (lastValue.current !== value) {
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

    const isTextValue = typeof value === 'string' && !/^-?\d+(\.\d+)?$/.test(value.trim())
    if (isTextValue) {
      setDisplayValue(value + suffix)
      hasAnimated.current = true
      return
    }

    const target = typeof value === 'number' ? value : parseFloat(value) || 0
    const isDecimal = !Number.isInteger(target)
    const startTime = Date.now()
    hasAnimated.current = true

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
      const easeOut = 1 - Math.pow(1 - progress, 3)
      let current = target * easeOut
      
      if (isDecimal && decimalPlaces > 0) {
        current = Math.round(current * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
      } else {
        current = Math.round(current)
      }

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

export default function ContactPage() {
  const { config, loading } = useContactConfig()
  const [heroRef, isHeroVisible] = useScrollAnimation({ threshold: 0.3 })
  const [contactInfoRef, isContactInfoVisible] = useScrollAnimation({ threshold: 0.2 })
  const [formRef, isFormVisible] = useScrollAnimation({ threshold: 0.2 })
  const [mapRef, isMapVisible] = useScrollAnimation({ threshold: 0.2 })
  const [socialRef, isSocialVisible] = useScrollAnimation({ threshold: 0.2 })
  const [statsRef, isStatsVisible] = useScrollAnimation({ threshold: 0.2 })
  const [ctaRef, isCtaVisible] = useScrollAnimation({ threshold: 0.3 })

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Lấy data từ config
  const hero = config?.hero || {}
  const contactForm = config?.contact_form || {}
  const contactInfo = config?.info || {}
  const mapEmbedUrl = config?.map_embed_url || ''
  const socialMedia = config?.social_media || []
  const trustStats = config?.trustStats || {}
  const cta = config?.cta || {}

  const contactInfoList = [
    {
      icon: Phone,
      title: "Điện thoại",
      value: contactInfo.phone || "(+84) 096 960 6095",
      href: `tel:${(contactInfo.phone || "").replace(/\D/g, "")}`,
      color: "from-blue-500/20 to-blue-600/10",
      borderColor: "border-blue-500/30",
      description: "Gọi ngay để đặt bàn hoặc đặt món",
    },
    {
      icon: Mail,
      title: "Email",
      value: contactInfo.email || "khoanguyenminh222@gmail.com",
      href: `mailto:${contactInfo.email || "khoanguyenminh222@gmail.com"}`,
      color: "from-pink-500/20 to-pink-600/10",
      borderColor: "border-pink-500/30",
      description: "Gửi email cho chúng tôi bất cứ lúc nào",
    },
    {
      icon: MapPin,
      title: "Địa chỉ",
      value: contactInfo.address || "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
      href: null,
      color: "from-green-500/20 to-green-600/10",
      borderColor: "border-green-500/30",
      description: "Đến thăm chúng tôi tại cửa hàng",
    },
    {
      icon: Clock,
      title: "Giờ mở cửa",
      value: contactInfo.working_hours || "Thứ 2 - Chủ Nhật: 8:00 - 22:00",
      href: null,
      color: "from-orange-500/20 to-orange-600/10",
      borderColor: "border-orange-500/30",
      description: "Chúng tôi phục vụ bạn mỗi ngày",
    },
  ]

  const socialMediaList = socialMedia.map((social) => {
    const Icon = getIconComponent(social.icon)
    return {
      ...social,
      icon: Icon,
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setTimeout(() => setSubmitSuccess(false), 5000)
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`relative min-h-[600px] md:min-h-[700px] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12 overflow-hidden bg-linear-to-br from-primary/10 via-background to-primary/5 scroll-fade-in ${
          isHeroVisible ? "visible" : ""
        }`}
      >
        {/* Decorative background elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-6xl mx-auto text-center space-y-6">
          {hero.badge && (
            <div className="inline-block">
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20">
                {hero.badge}
              </span>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display bg-linear-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent leading-tight">
            {hero.title || 'Chúng Tôi Luôn Sẵn Sàng Phục Vụ Bạn'}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {hero.description || 'Hãy liên hệ với chúng tôi để được tư vấn, đặt bàn hoặc giải đáp mọi thắc mắc. Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            {hero.cta_primary && (
              <a
                href={hero.cta_primary.link || 'tel:+84969606095'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {hero.cta_primary.text || 'Gọi Ngay'}
                <Phone className="w-5 h-5" />
              </a>
            )}
            {hero.cta_secondary && (
              <Link
                href={hero.cta_secondary.link || '/menu'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {hero.cta_secondary.text || 'Xem Thực Đơn'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Contact Info Cards Section */}
      <section
        ref={contactInfoRef}
        className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-card/50 backdrop-blur-sm scroll-fade-in ${
          isContactInfoVisible ? "visible" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfoList.map((info, index) => {
              const Icon = info.icon
              return (
                <div
                  key={index}
                  className={`group relative bg-card border-2 ${info.borderColor} rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 scroll-scale-in ${
                    isContactInfoVisible ? "visible" : ""
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-linear-to-br ${info.color} rounded-xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                  
                  <div className="relative z-10">
                    <div className="mb-4 inline-block p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">{info.title}</h3>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="text-muted-foreground hover:text-primary transition-colors block mb-2"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-muted-foreground mb-2">{info.value}</p>
                    )}
                    <p className="text-xs text-muted-foreground/70">{info.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div
              ref={formRef}
              className={`scroll-fade-in ${isFormVisible ? "visible" : ""}`}
            >
              <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Gửi Tin Nhắn
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-display text-card-foreground mb-2">
                    {contactForm.title || 'Gửi Tin Nhắn Cho Chúng Tôi'}
                  </h2>
                  <p className="text-muted-foreground">
                    {contactForm.description || 'Điền form bên dưới và chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        {contactForm.fields?.name_label || 'Họ và tên'} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        {contactForm.fields?.email_label || 'Email'} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        {contactForm.fields?.phone_label || 'Số điện thoại'}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="0901234567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        {contactForm.fields?.subject_label || 'Chủ đề'}
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="Đặt bàn / Tư vấn / Khác"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      {contactForm.fields?.message_label || 'Tin nhắn'} <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                      placeholder="Nhập tin nhắn của bạn..."
                    />
                  </div>

                  {submitSuccess && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <p className="text-sm text-green-500 font-medium">
                        Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất có thể.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        {contactForm.fields?.submit_text || 'Gửi tin nhắn'}
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Map Section */}
            <div
              ref={mapRef}
              className={`scroll-fade-in ${isMapVisible ? "visible" : ""}`}
            >
              <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg h-full">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Vị Trí
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-display text-card-foreground mb-2">
                    Đến Thăm Chúng Tôi
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {contactInfo.address || "123 Đường ABC, Quận 1, TP. Hồ Chí Minh"}
                  </p>
                </div>

                {mapEmbedUrl ? (
                  <div className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-border shadow-lg">
                    <iframe
                      src={mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <MapPin className="w-16 h-16 text-primary/30 mx-auto" />
                      <p className="text-muted-foreground">Chưa có bản đồ</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats Section */}
      {trustStats.show && (
        <section
          ref={statsRef}
          className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-primary/10 to-primary/5 scroll-fade-in ${
            isStatsVisible ? "visible" : ""
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Uy Tín
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-card-foreground mb-4">
                {trustStats.title || 'Khách Hàng Tin Tưởng'}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {trustStats.description || 'Những con số nói lên chất lượng dịch vụ của chúng tôi'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-all">
                <div className="flex justify-center mb-3">
                  <Star className="w-10 h-10 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-display">
                  <AnimatedNumber value={trustStats.averageRating || 4.9} isVisible={isStatsVisible} duration={2000} />
                </div>
                <p className="text-muted-foreground text-lg">Đánh giá trung bình</p>
              </div>
              <div className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-all">
                <div className="flex justify-center mb-3">
                  <MessageCircle className="w-10 h-10 text-primary" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-display">
                  <AnimatedNumber value={trustStats.totalReviews || 1247} isVisible={isStatsVisible} duration={2000} />
                </div>
                <p className="text-muted-foreground text-lg">Tổng đánh giá</p>
              </div>
              <div className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-all">
                <div className="flex justify-center mb-3">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-display">
                  <AnimatedNumber value={trustStats.verifiedCustomers || 98} isVisible={isStatsVisible} duration={2000} suffix="%" />
                </div>
                <p className="text-muted-foreground text-lg">Khách hàng đã xác minh</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Social Media Section */}
      {socialMediaList.length > 0 && (
        <section
          ref={socialRef}
          className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 scroll-fade-in ${
            isSocialVisible ? "visible" : ""
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Kết Nối
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-card-foreground mb-4">
                Theo Dõi Chúng Tôi
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Kết nối với chúng tôi trên các mạng xã hội để cập nhật những món ăn mới và ưu đãi đặc biệt
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {socialMediaList.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative bg-card border-2 border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 scroll-scale-in ${
                      isSocialVisible ? "visible" : ""
                    } ${social.color || 'text-foreground'}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground mb-1">{social.name}</h3>
                        <p className="text-sm text-muted-foreground">{social.description || 'Kết nối với chúng tôi'}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-primary to-primary-dark relative overflow-hidden scroll-fade-in ${
          isCtaVisible ? "visible" : ""
        }`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white">
            {cta.title || 'Sẵn Sàng Đặt Món Ngay?'}
          </h2>

          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            {cta.description || 'Gọi điện hoặc đến thăm chúng tôi để trải nghiệm hương vị tuyệt vời'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            {cta.button_primary && (
              <a
                href={cta.button_primary.link || 'tel:+84969606095'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-white/90 text-primary rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {cta.button_primary.text || 'Gọi Đặt Bàn'}
                <Phone className="w-5 h-5" />
              </a>
            )}
            {cta.button_secondary && (
              <Link
                href={cta.button_secondary.link || '/menu'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 border border-white/30"
              >
                {cta.button_secondary.text || 'Xem Thực Đơn'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
