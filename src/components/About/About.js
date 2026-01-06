"use client"

import { CheckCircle2, Zap, Heart } from "lucide-react"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { useLandingConfig } from "@/hooks/useLandingConfig"
import * as lucideIcons from "lucide-react"

export default function About() {
  const { config } = useLandingConfig()
  const aboutConfig = config?.about || {}
  const sectionTitle = aboutConfig.section_title || 'Giới thiệu'
  const sectionDescription = aboutConfig.section_description || 'Cam kết mang đến cho bạn những trải nghiệm ẩm thực tuyệt vời nhất'
  const configFeatures = aboutConfig.features || []
  
  const [headerRef, isHeaderVisible] = useScrollAnimation({ threshold: 0.2 })
  const [card1Ref, isCard1Visible] = useScrollAnimation({ threshold: 0.2 })
  const [card2Ref, isCard2Visible] = useScrollAnimation({ threshold: 0.2 })
  const [card3Ref, isCard3Visible] = useScrollAnimation({ threshold: 0.2 })
  const [card4Ref, isCard4Visible] = useScrollAnimation({ threshold: 0.2 })
  const [card5Ref, isCard5Visible] = useScrollAnimation({ threshold: 0.2 })
  const [card6Ref, isCard6Visible] = useScrollAnimation({ threshold: 0.2 })

  const refs = [card1Ref, card2Ref, card3Ref, card4Ref, card5Ref, card6Ref]
  const visibles = [isCard1Visible, isCard2Visible, isCard3Visible, isCard4Visible, isCard5Visible, isCard6Visible]

  // Map config features to component format
  const features = configFeatures.map((feature, index) => {
    const IconComponent = feature.icon && lucideIcons[feature.icon] ? lucideIcons[feature.icon] : CheckCircle2
    return {
      icon: IconComponent,
      title: feature.title,
      description: feature.description,
      ref: refs[index] || card1Ref,
      isVisible: visibles[index] !== undefined ? visibles[index] : isCard1Visible,
    }
  })

  // Fallback to default features if no config
  const defaultFeatures = [
    { icon: CheckCircle2, title: "Chất lượng", description: "Nguyên liệu tươi ngon, được chọn lọc kỹ càng từ những nhà cung cấp uy tín", ref: card1Ref, isVisible: isCard1Visible },
    { icon: Zap, title: "Nhanh chóng", description: "Giao hàng nhanh chóng, đúng giờ như đã hứa với dịch vụ chuyên nghiệp", ref: card2Ref, isVisible: isCard2Visible },
    { icon: Heart, title: "Tận tâm", description: "Phục vụ với sự nhiệt tình và chuyên nghiệp, luôn đặt khách hàng lên hàng đầu", ref: card3Ref, isVisible: isCard3Visible },
  ]
  
  const finalFeatures = features.length > 0 ? features : defaultFeatures

  return (
    <section id="about" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto overflow-hidden">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-12 scroll-fade-in ${isHeaderVisible ? "visible" : ""}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">{sectionTitle}</h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {sectionDescription}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-3">
          {finalFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                ref={feature.ref}
                className={`bg-card border border-border rounded-lg p-6 text-center hover:shadow-sm hover:shadow-black/10 hover:border-primary/50 transition-all duration-300 group scroll-fade-in ${
                  index === 0 ? "scroll-delay-100" : index === 1 ? "scroll-delay-200" : "scroll-delay-300"
                } ${feature.isVisible ? "visible" : ""}`}
              >
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-8 h-8" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold font-display text-card-foreground mb-2">{feature.title}</h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
