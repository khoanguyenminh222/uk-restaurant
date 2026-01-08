"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import Header from "@/components/Header/Header"
import Footer from "@/components/Footer/Footer"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
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

export default function AboutPage() {
  const [heroRef, isHeroVisible] = useScrollAnimation({ threshold: 0.3 })
  const [missionRef, isMissionVisible] = useScrollAnimation({ threshold: 0.2 })
  const [valuesRef, isValuesVisible] = useScrollAnimation({ threshold: 0.2 })
  const [statsRef, isStatsVisible] = useScrollAnimation({ threshold: 0.3 })
  const [teamRef, isTeamVisible] = useScrollAnimation({ threshold: 0.2 })
  const [ctaRef, isCtaVisible] = useScrollAnimation({ threshold: 0.3 })

  const values = [
    {
      icon: Heart,
      title: "Tâm Huyết",
      description: "Chúng tôi đổ từng phần tâm huyết vào từng món ăn, đảm bảo chất lượng tuyệt vời."
    },
    {
      icon: Leaf,
      title: "Nguyên Liệu Tươi",
      description: "Sử dụng nguyên liệu tươi sống, hữu cơ từ các nhà cung cấp địa phương."
    },
    {
      icon: Zap,
      title: "Sáng Tạo",
      description: "Kết hợp truyền thống với hiện đại để tạo ra những món ăn độc đáo."
    },
    {
      icon: Users,
      title: "Cộng Đồng",
      description: "Tạo không gian ấm cúng để khách hàng kết nối và chia sẻ."
    }
  ]

  const stats = [
    { number: "10+", label: "Năm Kinh Nghiệm" },
    { number: "5000+", label: "Khách Hàng Hài Lòng" },
    { number: "50+", label: "Món Ăn Đặc Biệt" },
    { number: "24/7", label: "Phục Vụ" }
  ]

  const team = [
    {
      name: "Nguyễn Văn A",
      role: "Đầu Bếp Chính",
      specialty: "Chuyên môn: Ẩm Thực Châu Á",
      icon: ChefHat
    },
    {
      name: "Trần Thị B",
      role: "Quản Lý Nhà Hàng",
      specialty: "Chuyên môn: Dịch Vụ Khách Hàng",
      icon: Users
    },
    {
      name: "Lê Văn C",
      role: "Đầu Bếp Phụ",
      specialty: "Chuyên môn: Nấu Ăn Hiện Đại",
      icon: Utensils
    }
  ]

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`relative min-h-[600px] md:min-h-[700px] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 scroll-fade-in ${
          isHeroVisible ? "visible" : ""
        }`}
      >
        {/* Decorative background elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-block">
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20">
              🍽️ Khám Phá Câu Chuyện Của Chúng Tôi
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent leading-tight">
            Ẩm Thực Không Chỉ Là Thức Ăn
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Đó là một hành trình tình yêu, sáng tạo và đam mê. Chúng tôi tự hào mang đến những trải nghiệm ẩm thực tuyệt vời cho mỗi khách hàng.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Khám Phá Thực Đơn
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Liên Hệ Chúng Tôi
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section
        ref={missionRef}
        className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-card/50 backdrop-blur-sm scroll-fade-in ${
          isMissionVisible ? "visible" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-6">
              <div>
                <span className="text-primary font-semibold text-sm uppercase tracking-widest">
                  ✨ Sứ Mệnh Của Chúng Tôi
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-display mt-3 text-card-foreground">
                  Nấu Ăn Với Tâm Và Tay
                </h2>
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed">
                Tại nhà hàng chúng tôi, mỗi món ăn là một tác phẩm nghệ thuật được tạo ra từ những nguyên liệu tươi sống nhất. Chúng tôi tin rằng ẩm thực là ngôn ngữ quốc tế của tình yêu.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Award className="w-6 h-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-1">Chất Lượng Đảm Bảo</h3>
                    <p className="text-muted-foreground text-sm">
                      Kiểm tra chất lượng nghiêm ngặt cho mỗi thành phần trước khi vào bếp.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Globe className="w-6 h-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-1">Hương Vị Đa Sắc</h3>
                    <p className="text-muted-foreground text-sm">
                      Kết hợp các nền ẩm thực khác nhau để tạo ra những trải nghiệm độc đáo.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-1">Phục Vụ Nhanh Chóng</h3>
                    <p className="text-muted-foreground text-sm">
                      Từ đơn hàng đến bàn của bạn, tất cả đều được làm với tốc độ và chuyên môn.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative h-96 md:h-96 rounded-lg overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <ChefHat className="w-24 h-24 text-primary/30 mx-auto" />
                  <p className="text-muted-foreground font-display text-xl">
                    Đam Mê Ẩm Thực
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section
        ref={valuesRef}
        className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 scroll-fade-in ${
          isValuesVisible ? "visible" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-card-foreground mb-4">
              Những Giá Trị Cốt Lõi
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Những nguyên tắc này hướng dẫn mọi quyết định của chúng tôi, từ chọn nguyên liệu đến phục vụ khách hàng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div
                  key={index}
                  className="group p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 scroll-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4 inline-block p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-primary/5 scroll-fade-in ${
          isStatsVisible ? "visible" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg hover:bg-card/50 transition-colors"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-display">
                  {stat.number}
                </div>
                <p className="text-muted-foreground text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        ref={teamRef}
        className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 scroll-fade-in ${
          isTeamVisible ? "visible" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-card-foreground mb-4">
              Đội Ngũ Tài Năng
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Những người tài năng, đam mê và tận tâm làm nên sự khác biệt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => {
              const Icon = member.icon
              return (
                <div
                  key={index}
                  className="group bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 scroll-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden group-hover:from-primary/30 transition-all">
                    <Icon className="w-24 h-24 text-primary/30 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-card-foreground mb-1">{member.name}</h3>
                    <p className="text-primary font-medium text-sm mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm">{member.specialty}</p>
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
        className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-primary-dark relative overflow-hidden scroll-fade-in ${
          isCtaVisible ? "visible" : ""
        }`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white">
            Sẵn Sàng Trải Nghiệm Điều Kỳ Diệu?
          </h2>

          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Hãy đến thăm chúng tôi ngay hôm nay. Chúng tôi đang mong chờ sự có mặt của bạn.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-white/90 text-primary rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Xem Thực Đơn
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:+84123456789"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 border border-white/30"
            >
              Gọi Đặt Bàn
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
