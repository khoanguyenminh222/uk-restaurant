'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin, Phone, Mail, Clock, Send, Globe, Star,
  MessageCircle, Facebook, Instagram, Twitter, Youtube,
  Linkedin, Github, CheckCircle2, TrendingUp, Sparkles,
  ArrowRight
} from 'lucide-react'
import * as lucideIcons from 'lucide-react'
import { useContactConfig } from '@/hooks/useContactConfig'
import { useLandingConfig } from '@/hooks/useLandingConfig'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import Link from 'next/link'

// Icons mapping helper
const FacebookIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const getIconComponent = (iconName) => {
  if (!iconName || typeof iconName !== 'string') return Globe
  try {
    if (iconName === 'FacebookIcon' || iconName === 'Facebook') return FacebookIcon
    if (iconName === 'InstagramIcon' || iconName === 'Instagram') return InstagramIcon
    const Icon = lucideIcons[iconName]
    return Icon || Globe
  } catch {
    return Globe
  }
}

// Component số nhảy
function AnimatedNumber({ value, isVisible, duration = 2000, suffix = "" }) {
  const [displayValue, setDisplayValue] = useState("0")
  const hasAnimated = useRef(false)
  const lastValue = useRef(value)

  useEffect(() => {
    // Reset animation if value changes significantly or first run
    if (lastValue.current !== value) {
      hasAnimated.current = false
      lastValue.current = value
    }

    if (!isVisible || hasAnimated.current) {
      if (lastValue.current !== value) {
        // Update logic if value changed but visible
        const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
        let formatted = numValue.toString();
        if (numValue >= 1000) {
          formatted = numValue.toLocaleString('vi-VN');
        } else if (!Number.isInteger(numValue)) {
          formatted = numValue.toFixed(1);
        }
        setDisplayValue(formatted + suffix);
        hasAnimated.current = true;
      }
      return;
    }

    const target = typeof value === 'number' ? value : parseFloat(value) || 0
    const isDecimal = !Number.isInteger(target)
    const startTime = Date.now()
    hasAnimated.current = true

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      let current = target * easeOut

      // Format logic
      let formatted = current.toString()
      if (target >= 1000) {
        formatted = Math.round(current).toLocaleString('vi-VN')
      } else if (isDecimal) {
        formatted = current.toFixed(1)
      } else {
        formatted = Math.round(current).toString()
      }

      setDisplayValue(formatted + suffix)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Final set
        let finalFormatted = target.toString()
        if (target >= 1000) {
          finalFormatted = target.toLocaleString('vi-VN')
        } else if (isDecimal) {
          finalFormatted = target.toFixed(1)
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
  const { config: landingConfig } = useLandingConfig()

  // Animation Refs
  const [heroRef, isHeroVisible] = useScrollAnimation()
  const [contactInfoRef, isContactInfoVisible] = useScrollAnimation({ threshold: 0.1 })
  const [formRef, isFormVisible] = useScrollAnimation()
  const [mapRef, isMapVisible] = useScrollAnimation()
  const [statsRef, isStatsVisible] = useScrollAnimation()
  const router = useRouter()

  // Kiểm tra hiển thị trang
  useEffect(() => {
    if (landingConfig && landingConfig.header && landingConfig.header.menu_items) {
      const contactItem = landingConfig.header.menu_items.find(item => item.id === 'contact');
      if (contactItem && contactItem.is_visible === false) {
        router.push('/');
      }
    }
  }, [landingConfig, router]);

  // Form State
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Trust Stats state (fetched from API)
  const [realStats, setRealStats] = useState(null)

  // Fetch real reviews stats - chỉ khi auto_calculate_stats = true (đồng bộ với Testimonials component)
  useEffect(() => {
    const fetchStats = async () => {
      // Kiểm tra flag từ landing config (giống Testimonials component)
      if (landingConfig?.testimonials?.auto_calculate_stats) {
        try {
          const res = await fetch('/api/reviews/stats');
          const data = await res.json();
          if (data.success) {
            setRealStats(data.data);
          }
        } catch (error) {
          console.error('Error fetching review stats:', error);
        }
      }
    };
    fetchStats();
  }, [landingConfig?.testimonials?.auto_calculate_stats]);

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true)
        setFormState({ name: '', email: '', phone: '', subject: '', message: '' })
        setTimeout(() => setSubmitSuccess(false), 5000)
      } else {
        alert(data.error || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      alert('Đã có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setIsSubmitting(false)
    }
  }



  // Desconstruct config with defaults safe
  const hero = config?.hero || {}
  const info = config?.info || {}
  const sectionMap = config?.section_map || {
    // Fallback for legacy support
    embed_url: config?.map_embed_url
  }
  const contactForm = config?.contact_form || {}
  const trustStats = config?.trustStats || {}
  const socials = config?.social_media || []
  const socialSection = config?.social_section || {}
  const cta = config?.cta || {}

  // Merge config stats with real stats if available
  // Logic giống Testimonials component:
  // 1. Nếu auto_calculate_stats = true và có realStats → dùng từ API
  // 2. Nếu không → dùng từ landingConfig.testimonials.trustStats (admin tự chọn)
  // 3. Nếu không có → dùng từ contact config trustStats
  // 4. Cuối cùng → default
  let displayStats = null
  if (landingConfig?.testimonials?.auto_calculate_stats && realStats) {
    // Tự động tính từ reviews
    displayStats = {
      averageRating: realStats.averageRating,
      totalReviews: realStats.totalReviews,
      verifiedCustomers: realStats.verifiedCustomers,
    }
  } else if (landingConfig?.testimonials?.trustStats) {
    // Dùng từ landing config (admin tự chọn)
    displayStats = {
      averageRating: landingConfig.testimonials.trustStats.averageRating,
      totalReviews: landingConfig.testimonials.trustStats.totalReviews,
      verifiedCustomers: landingConfig.testimonials.trustStats.verifiedCustomers,
    }
  } else if (trustStats && (trustStats.averageRating || trustStats.totalReviews || trustStats.verifiedCustomers)) {
    // Dùng từ contact config
    displayStats = {
      averageRating: trustStats.averageRating || 4.9,
      totalReviews: trustStats.totalReviews || 1247,
      verifiedCustomers: trustStats.verifiedCustomers || 98,
    }
  } else {
    // Fallback về default
    displayStats = {
      averageRating: 4.9,
      totalReviews: 1247,
      verifiedCustomers: 98,
    }
  }

  const contactInfoList = [
    {
      icon: Phone,
      title: info.phone_title || 'Điện thoại',
      value: info.phone || '(+84) 096 960 6095',
      description: info.phone_description || 'Gọi ngay để đặt bàn hoặc đặt món',
      href: `tel:${(info.phone || '0969606095').replace(/[^0-9]/g, '')}`,
      color: 'from-blue-500/20 to-cyan-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      icon: Mail,
      title: info.email_title || 'Email',
      value: info.email || 'khoanguyenminh222@gmail.com',
      description: info.email_description || 'Gửi email cho chúng tôi bất cứ lúc nào',
      href: `mailto:${info.email || 'khoanguyenminh222@gmail.com'}`,
      color: 'from-purple-500/20 to-pink-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      icon: MapPin,
      title: info.address_title || 'Địa chỉ',
      value: info.address || '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
      description: info.address_description || 'Đến thăm chúng tôi tại cửa hàng',
      href: null,
      color: 'from-orange-500/20 to-red-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      icon: Clock,
      title: info.working_hours_title || 'Giờ mở cửa',
      value: info.working_hours || 'Thứ 2 - Chủ Nhật: 8:00 - 22:00',
      description: info.working_hours_description || 'Chúng tôi phục vụ bạn mỗi ngày',
      href: null,
      color: 'from-green-500/20 to-emerald-500/10',
      borderColor: 'border-green-500/20'
    }
  ]

  const SubmitIcon = getIconComponent(contactForm.fields?.submit_icon || 'Send');

  if (loading) {
    return (
      <section
        className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-linear-to-br from-primary/10 via-background to-primary/5"
      >
        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-primary/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10 max-w-6xl mx-auto w-full text-center space-y-8 animate-pulse">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 w-40 bg-muted rounded-full mx-auto mb-6"></div>
            <div className="h-12 md:h-16 lg:h-20 bg-muted rounded-2xl w-3/4 mx-auto mb-6"></div>
            <div className="h-4 md:h-6 bg-muted rounded-lg w-2/3 mx-auto mb-4"></div>
            <div className="h-4 md:h-6 bg-muted rounded-lg w-1/2 mx-auto mb-10"></div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="w-full sm:w-48 h-12 bg-muted rounded-full"></div>
              <div className="w-full sm:w-48 h-12 bg-muted rounded-full"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/20">

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-primary/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-blue-500/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {hero.image ? (
          <div className="absolute inset-0 z-0">
            <img
              src={hero.image}
              alt={hero.title || "Contact Hero"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-primary/50 via-background to-primary/30"></div>
        )}

        <div className={`max-w-6xl mx-auto text-center relative z-10 transition-all duration-1000 ${isHeroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-md hover:bg-primary/20 transition-colors">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className={`text-sm font-semibold tracking-wide uppercase ${hero.image ? 'text-primary-foreground' : 'text-primary'}`}>
              {hero.badge || 'Liên Hệ Với Chúng Tôi'}
            </span>
          </div>

          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight mb-6 ${hero.image ? 'text-white' : 'bg-linear-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent'}`}>
            {hero.title || 'Chúng Tôi Luôn Sẵn Sàng Phục Vụ Bạn'}
          </h1>

          <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${hero.image ? 'text-gray-200' : 'text-muted-foreground'}`}>
            {hero.description || 'Hãy liên hệ với chúng tôi để được tư vấn, đặt bàn hoặc giải đáp mọi thắc mắc. Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={hero.cta_primary?.link || "tel:+84969606095"}
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-primary-foreground rounded-full font-bold text-lg shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              {hero.cta_primary?.text || "Gọi Ngay"}
            </a>
            {hero.cta_secondary && hero.cta_secondary.text && (
              <Link
                href={hero.cta_secondary.link || "/menu"}
                className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg border-2 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 ${hero.image
                  ? 'border-white text-white hover:bg-white hover:text-primary'
                  : 'border-border bg-card text-card-foreground hover:border-primary hover:text-primary'
                  }`}
              >
                {hero.cta_secondary.text}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Contact Info Cards Section */}
      <section
        ref={contactInfoRef}
        className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-card/50 backdrop-blur-sm scroll-fade-in ${isContactInfoVisible ? "visible" : ""}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {contactInfoList.map((info, index) => {
              const Icon = info.icon
              return (
                <div
                  key={index}
                  className={`group relative bg-card border-2 ${info.borderColor} rounded-xl p-3 sm:p-4 md:p-6 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 scroll-scale-in ${isContactInfoVisible ? "visible" : ""}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${info.color} rounded-xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>

                  <div className="relative z-10">
                    <div className="mb-2 sm:mb-3 md:mb-4 inline-block p-2 sm:p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-card-foreground mb-1 sm:mb-2 leading-snug">{info.title}</h3>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="text-muted-foreground hover:text-primary transition-colors block mb-1 sm:mb-2 text-xs sm:text-sm md:text-base font-medium wrap-break-word"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-muted-foreground mb-1 sm:mb-2 text-xs sm:text-sm md:text-base font-medium wrap-break-word">{info.value}</p>
                    )}
                    <p className="text-[10px] sm:text-xs text-muted-foreground/70 hidden sm:block">{info.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Content Grid (Map + Form) */}
      <section className="pb-16 md:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* Map Section */}
            <div
              ref={mapRef}
              className={`scroll-slide-right ${isMapVisible ? "visible" : ""}`}
            >
              <div className="sticky top-24">
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {sectionMap.badge || 'Vị Trí'}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-card-foreground mb-2">
                  {sectionMap.title || 'Đến Thăm Chúng Tôi'}
                </h2>
                <p className="text-lg text-primary font-medium mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {info.address || '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'}
                </p>

                {sectionMap.embed_url ? (
                  <div className="relative w-full h-96 rounded-2xl overflow-hidden border-2 border-border shadow-2xl skew-y-1 hover:skew-y-0 transition-all duration-500">
                    <iframe
                      src={sectionMap.embed_url}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      className="absolute inset-0  transition-all duration-700"
                    ></iframe>
                  </div>
                ) : (
                  <div className="relative w-full h-96 rounded-2xl overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <MapPin className="w-16 h-16 text-primary/30 mx-auto" />
                      <p className="text-muted-foreground">{sectionMap.empty_text || 'Chưa có bản đồ'}</p>
                    </div>
                  </div>
                )}

                {/* Social Links below Map */}
                <div className="mt-10 pl-2">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {socialSection.title || 'Theo Dõi Chúng Tôi'}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {socials.map((social, idx) => {
                      const SocialIcon = getIconComponent(social.icon);
                      return (
                        <a
                          key={idx}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative w-12 h-12 flex items-center justify-center bg-card border border-border rounded-full hover:scale-110 hover:border-primary transition-all duration-300"
                          title={social.name}
                        >
                          <SocialIcon className={`w-5 h-5 ${social.color || 'text-muted-foreground'} group-hover:text-primary transition-colors`} />
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Section */}
            <div
              ref={formRef}
              className={`bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-xl scroll-slide-left ${isFormVisible ? "visible" : ""}`}
            >
              <div className="inline-flex items-center gap-2 mb-2 sm:mb-3 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {contactForm.badge || 'Gửi Tin Nhắn'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-card-foreground mb-1 sm:mb-2">
                {contactForm.title || 'Gửi Tin Nhắn Cho Chúng Tôi'}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 md:mb-8">
                {contactForm.description || 'Điền form bên dưới và chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất'}
              </p>

              {submitSuccess ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">Gửi Thành Công!</h3>
                  <p className="text-muted-foreground">
                    {contactForm.success_message || 'Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất có thể.'}
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-6 text-primary font-medium hover:underline"
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
                        {contactForm.fields?.name_label || 'Họ và tên'}
                        <span className="text-red-500 font-semibold" title="Bắt buộc">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all"
                        placeholder="Nhập..."
                        aria-required="true"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
                        {contactForm.fields?.email_label || 'Email'}
                        <span className="text-red-500 font-semibold" title="Bắt buộc">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all"
                        placeholder="Nhập..."
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
                        {contactForm.fields?.phone_label || 'Số điện thoại'}
                        <span className="text-red-500 font-semibold" title="Bắt buộc">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formState.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all"
                        placeholder="Nhập..."
                        aria-required="true"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-foreground">
                        {contactForm.fields?.subject_label || 'Chủ đề'}
                        <span className="text-muted-foreground text-xs font-normal ml-1">(Tùy chọn)</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formState.subject}
                        onChange={handleChange}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all"
                        placeholder="Nhập..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1">
                      {contactForm.fields?.message_label || 'Tin nhắn'}
                      <span className="text-red-500 font-semibold" title="Bắt buộc">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all resize-none"
                      placeholder="Vui lòng nhập..."
                      aria-required="true"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 sm:px-6 sm:py-3 md:py-4 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        {contactForm.fields?.submit_text || 'Gửi tin nhắn'}
                        <SubmitIcon className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats Section */}
      {trustStats.show && (
        <section
          ref={statsRef}
          className={`py-20 md:py-28 relative overflow-hidden scroll-fade-in ${isStatsVisible ? "visible" : ""}`}
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-primary/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {trustStats.badge || 'Uy Tín'}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl p-2 font-bold font-display mb-6 bg-linear-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
                {trustStats.title || 'Khách Hàng Tin Tưởng'}
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                {trustStats.description || 'Những con số nói lên chất lượng dịch vụ của chúng tôi'}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {/* Stat Card 1 - Rating */}
              <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8">
                <div className="absolute inset-0 bg-linear-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl opacity-30"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mb-2 sm:mb-3 md:mb-4 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 fill-yellow-400" />
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-foreground mb-1 sm:mb-2">
                    <AnimatedNumber value={displayStats.averageRating} isVisible={isStatsVisible} duration={1500} />
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-muted-foreground font-medium leading-tight px-1">
                    {trustStats.averageRating_label || 'Đánh giá trung bình'}
                  </div>
                </div>
              </div>

              {/* Stat Card 2 - Reviews */}
              <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8">
                <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary-light/10 rounded-xl opacity-30"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mb-2 sm:mb-3 md:mb-4 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-foreground mb-1 sm:mb-2">
                    <AnimatedNumber value={displayStats.totalReviews} isVisible={isStatsVisible} duration={2000} />
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-muted-foreground font-medium leading-tight px-1">
                    {trustStats.totalReviews_label || 'Tổng đánh giá'}
                  </div>
                </div>
              </div>

              {/* Stat Card 3 - Verified */}
              <div className="relative col-span-2 md:col-span-1 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8">
                <div className="absolute inset-0 bg-linear-to-br from-green-500/20 to-green-600/10 rounded-xl opacity-30"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mb-2 sm:mb-3 md:mb-4 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-foreground mb-1 sm:mb-2">
                    <AnimatedNumber value={displayStats.verifiedCustomers} isVisible={isStatsVisible} duration={1500} suffix="%" />
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-muted-foreground font-medium leading-tight px-1">
                    {trustStats.verifiedCustomers_label || 'Khách hàng đã xác minh'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {cta && (cta.title || cta.button_primary || cta.button_secondary) && (
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            {cta.image ? (
              <>
                <img
                  src={cta.image}
                  alt="CTA Background"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70"></div>
              </>
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-primary/50 via-background to-primary/30"></div>
            )}
          </div>

          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className={`text-3xl md:text-5xl font-bold font-display p-2 mb-6 ${cta.image ? 'text-white' : 'bg-linear-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent'}`}>
              {cta.title || 'Sẵn Sàng Đặt Món Ngay?'}
            </h2>
            <p className={`text-xl mb-10 max-w-2xl mx-auto ${cta.image ? 'text-gray-300' : 'text-muted-foreground'}`}>
              {cta.description || 'Gọi điện hoặc đến thăm chúng tôi để trải nghiệm hương vị tuyệt vời'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {cta.button_primary && cta.button_primary.text && (
                <a
                  href={cta.button_primary.link || "tel:+84969606095"}
                  className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-primary-foreground rounded-full font-bold text-lg shadow-lg hover:shadow-primary/30 transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  {cta.button_primary.text}
                </a>
              )}
              {cta.button_secondary && cta.button_secondary.text && (
                <Link
                  href={cta.button_secondary.link || "/menu"}
                  className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${cta.image
                    ? 'bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white'
                    : 'bg-background hover:bg-muted text-primary border-2 border-primary/20 hover:border-primary'
                    }`}
                >
                  <ArrowRight className="w-5 h-5" />
                  {cta.button_secondary.text}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}


    </div>
  )
}
