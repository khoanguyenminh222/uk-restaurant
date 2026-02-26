"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { useAboutConfig } from "@/hooks/useAboutConfig"
import { useLandingConfig } from "@/hooks/useLandingConfig"
import * as lucideIcons from "lucide-react"
import {
  Award,
  Users,
  Heart,
  Leaf,
  Zap,
  Globe,
  ChefHat,
  Utensils,
  Clock,
  ArrowRight
} from "lucide-react"

// Helper function để lấy icon component
const getIconComponent = (iconName) => {
  if (!iconName || typeof iconName !== 'string') return Award
  try {
    const Icon = lucideIcons[iconName]
    return Icon || Award
  } catch {
    return Award
  }
}

export default function AboutPage() {
  const { config, loading } = useAboutConfig()
  const { config: landingConfig } = useLandingConfig()
  const [heroRef, isHeroVisible] = useScrollAnimation({ threshold: 0.3 })
  const [missionRef, isMissionVisible] = useScrollAnimation({ threshold: 0.2 })
  const [valuesRef, isValuesVisible] = useScrollAnimation({ threshold: 0.2 })
  const [statsRef, isStatsVisible] = useScrollAnimation({ threshold: 0.3 })
  const [teamRef, isTeamVisible] = useScrollAnimation({ threshold: 0.2 })
  const [ctaRef, isCtaVisible] = useScrollAnimation({ threshold: 0.3 })
  const router = useRouter()

  // Kiểm tra hiển thị trang
  useEffect(() => {
    if (landingConfig && landingConfig.header && landingConfig.header.menu_items) {
      const aboutItem = landingConfig.header.menu_items.find(item => item.id === 'about');
      if (aboutItem && aboutItem.is_visible === false) {
        router.push('/');
      }
    }
  }, [landingConfig, router]);

  // Lấy data từ config hoặc dùng default
  const hero = config?.hero || {}
  const mission = config?.mission || {}
  const values = config?.values || {}
  const team = config?.team || {}
  const cta = config?.cta || {}

  // Features từ config (dùng cho values section)
  const configFeatures = config?.features || []
  const features = configFeatures
    .map((feature, index) => ({
      icon: getIconComponent(feature.icon),
      title: feature.title,
      description: feature.description,
      color: feature.color,
      borderColor: feature.borderColor,
      order: feature.order || index + 1,
    }))
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  // Stats từ landing config (whyChooseUs) thay vì riêng biệt
  const landingStats = landingConfig?.whyChooseUs?.stats || []
  const stats = landingStats.map((stat) => ({
    number: stat.value,
    label: stat.label,
    icon: getIconComponent(stat.icon),
    color: stat.color,
  }))

  // Team members từ config
  const teamMembers = team?.members || []
  const teamList = teamMembers.map((member) => ({
    name: member.name,
    role: member.role,
    specialty: member.specialty,
    icon: getIconComponent(member.icon),
  }))

  if (loading) {
    return (
      <section
        className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12 overflow-hidden bg-linear-to-br from-primary/10 via-background to-primary/5"
      >
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="relative z-10 max-w-6xl mx-auto w-full text-center space-y-8 animate-pulse">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 w-32 bg-muted rounded-full mx-auto mb-6"></div>
            <div className="h-12 md:h-16 lg:h-20 bg-muted rounded-2xl w-3/4 mx-auto mb-6"></div>
            <div className="h-4 md:h-6 bg-muted rounded-lg w-2/3 mx-auto mb-4"></div>
            <div className="h-4 md:h-6 bg-muted rounded-lg w-1/2 mx-auto mb-10"></div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="w-full sm:w-48 h-12 bg-muted rounded-xl"></div>
              <div className="w-full sm:w-48 h-12 bg-muted rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`relative min-h-[600px] md:min-h-[700px] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12 overflow-hidden bg-linear-to-br from-primary/50 via-background to-primary/30 scroll-fade-in ${isHeroVisible ? "visible" : ""
          }`}
      >
        {/* Background Image */}
        {hero.image && (
          <>
            <div className="absolute inset-0 z-0">
              <Image
                src={hero.image}
                alt="Hero background"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Dark overlay để text nổi bật hơn */}
            <div className="absolute inset-0 z-10 bg-black/40"></div>
          </>
        )}

        {/* Decorative background elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          {hero.badge && (
            <div className="inline-block">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${hero.image
                ? 'bg-white/90 text-primary border-white/50 backdrop-blur-sm'
                : 'bg-primary/10 text-primary border-primary/20'
                }`}>
                {hero.badge}
              </span>
            </div>
          )}

          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight ${hero.image
            ? 'text-white drop-shadow-lg'
            : 'bg-linear-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent'
            }`}>
            {hero.title || 'Ẩm Thực Không Chỉ Là Thức Ăn'}
          </h1>

          <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed ${hero.image
            ? 'text-white/95 drop-shadow-md'
            : 'text-muted-foreground'
            }`}>
            {hero.description || 'Đó là một hành trình tình yêu, sáng tạo và đam mê. Chúng tôi tự hào mang đến những trải nghiệm ẩm thực tuyệt vời cho mỗi khách hàng.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            {hero.cta_primary && (
              <Link
                href={hero.cta_primary.link || '/menu'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                {hero.cta_primary.text || 'Khám Phá Thực Đơn'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            {hero.cta_secondary && (
              <Link
                href={hero.cta_secondary.link || '#contact'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                {hero.cta_secondary.text || 'Liên Hệ Chúng Tôi'}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section
        ref={missionRef}
        className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-card/50 backdrop-blur-sm scroll-fade-in ${isMissionVisible ? "visible" : ""
          }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-6">
              <div>
                {mission.badge && (
                  <span className="text-primary font-semibold text-sm uppercase tracking-widest">
                    {mission.badge}
                  </span>
                )}
                <h2 className="text-3xl md:text-4xl font-bold font-display mt-3 text-card-foreground">
                  {mission.title || 'Nấu Ăn Với Tâm Và Tay'}
                </h2>
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed">
                {mission.description || 'Tại nhà hàng chúng tôi, mỗi món ăn là một tác phẩm nghệ thuật được tạo ra từ những nguyên liệu tươi sống nhất. Chúng tôi tin rằng ẩm thực là ngôn ngữ quốc tế của tình yêu.'}
              </p>

              <div className="space-y-4">
                {(mission.items || []).map((item, index) => {
                  const Icon = getIconComponent(item.icon)
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="shrink-0">
                        <Icon className="w-6 h-6 text-primary mt-1" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground mb-1">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative h-96 md:h-96 rounded-lg overflow-hidden shadow-xl">
              {mission.image ? (
                <>
                  <Image
                    src={mission.image}
                    alt={mission.title || 'Mission'}
                    fill
                    className="object-cover"
                  />
                  {/* <div className="absolute inset-0 bg-linear-to-br from-primary/15 to-primary/5"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="text-center space-y-4 bg-card/40 backdrop-blur-xs rounded-lg p-6">
                      <ChefHat className="w-16 h-16 text-primary mx-auto" />
                      <p className="text-card-light font-display text-lg font-semibold">
                        {mission.title || 'Đam Mê Ẩm Thực'}
                      </p>
                    </div>
                  </div> */}
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/5 rounded-lg"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <ChefHat className="w-24 h-24 text-primary/30 mx-auto" />
                      <p className="text-muted-foreground font-display text-xl">
                        Đam Mê Ẩm Thực
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section
        ref={valuesRef}
        className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 scroll-fade-in ${isValuesVisible ? "visible" : ""
          }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-card-foreground mb-4">
              {values.title || 'Những Giá Trị Cốt Lõi'}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {values.description || 'Những nguyên tắc này hướng dẫn mọi quyết định của chúng tôi, từ chọn nguyên liệu đến phục vụ khách hàng.'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className={`group p-4 sm:p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 scroll-scale-in ${isValuesVisible ? "visible" : ""
                    }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-3 sm:mb-4 inline-block p-2 sm:p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold text-card-foreground mb-1 sm:mb-2 leading-snug">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-primary/10 to-primary/5 scroll-fade-in ${isStatsVisible ? "visible" : ""
          }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="text-center p-4 sm:p-6 rounded-lg hover:bg-card/50 transition-colors"
                >
                  {Icon && (
                    <div className="flex justify-center mb-2">
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    </div>
                  )}
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-1 sm:mb-2 font-display">
                    {stat.number}
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-lg">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        ref={teamRef}
        className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 scroll-fade-in ${isTeamVisible ? "visible" : ""
          }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-card-foreground mb-4">
              {team.title || 'Đội Ngũ Tài Năng'}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {team.description || 'Những người tài năng, đam mê và tận tâm làm nên sự khác biệt.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamList.map((member, index) => {
              const Icon = member.icon
              return (
                <div
                  key={index}
                  className={`group bg-card rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 scroll-scale-in ${isTeamVisible ? "visible" : ""
                    }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center p-4 sm:p-6 gap-4 sm:gap-6">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 group-hover:from-primary/30 transition-all">
                      <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-card-foreground mb-1 truncate">{member.name}</h3>
                      <p className="text-primary font-medium text-sm mb-1">{member.role}</p>
                      <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2">{member.specialty}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden scroll-fade-in ${isCtaVisible ? "visible" : ""
          }`}
      >
        {/* Background - Image or Gradient */}
        <div className="absolute inset-0 z-0">
          {cta.image ? (
            <>
              <img
                src={cta.image}
                alt="CTA Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60"></div>
            </>
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-primary/50 via-background to-primary/30"></div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold font-display ${cta.image ? 'text-white' : 'bg-linear-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent'
            }`}>
            {cta.title || 'Sẵn Sàng Trải Nghiệm Điều Kỳ Diệu?'}
          </h2>

          <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed ${cta.image ? 'text-white/90' : 'text-muted-foreground'
            }`}>
            {cta.description || 'Hãy đến thăm chúng tôi ngay hôm nay. Chúng tôi đang mong chờ sự có mặt của bạn.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            {cta.button_primary && (
              <Link
                href={cta.button_primary.link || '/menu'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                {cta.button_primary.text || 'Xem Thực Đơn'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            {cta.button_secondary && (
              <a
                href={cta.button_secondary.link || 'tel:+84123456789'}
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${cta.image
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                  : 'bg-background hover:bg-muted text-primary border-2 border-primary/20 hover:border-primary'
                  }`}
              >
                {cta.button_secondary.text || 'Gọi Đặt Bàn'}
              </a>
            )}
          </div>
        </div>
      </section>


    </div>
  )
}
