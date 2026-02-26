"use client"
import * as LucideIcons from "lucide-react"
import { Utensils } from "lucide-react"
import { useLandingConfig } from "@/hooks/useLandingConfig"
import { useContactConfig } from "@/hooks/useContactConfig"

export default function Footer() {
  const { config: landingConfig } = useLandingConfig()
  const { config: contactConfig } = useContactConfig()

  const footerConfig = landingConfig?.footer || {}
  const restaurantName = footerConfig.restaurant_name || 'UK Restaurant'
  const slogan = footerConfig.slogan || 'Ăn no khỏi "bàn"'
  const description = footerConfig.description || 'Khám phá hương vị đặc biệt với thực đơn đa dạng, nguyên liệu tươi ngon và dịch vụ tận tâm.'
  const copyrightText = footerConfig.copyright_text || 'Tất cả quyền được bảo lưu.'
  const links = footerConfig.links || []
  const currentYear = new Date().getFullYear()

  const socialMedia = contactConfig?.social_media || []

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10 md:gap-12 text-center md:text-left">
          {/* Brand Section */}
          <div className="space-y-5 md:space-y-6 max-w-lg">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Utensils className="w-8 h-8 text-primary" />
              <h3 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-tight">{restaurantName}</h3>
            </div>
            <div className="space-y-3 md:space-y-4">
              <p className="text-lg md:text-xl font-medium text-foreground/90 italic leading-snug">
                "{slogan}"
              </p>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-md mx-auto md:mx-0">
                {description}
              </p>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex flex-col items-center md:items-end gap-4 pt-2">
            {socialMedia.length > 0 && (
              <>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 hidden md:block">
                  Kết nối với chúng tôi
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {socialMedia.map((social, index) => {
                    const Icon = LucideIcons[social.icon] || LucideIcons.Globe
                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-muted border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group scale-110 md:scale-100"
                        title={social.name}
                      >
                        <Icon className={`w-5 h-5 ${social.color || 'text-muted-foreground'} group-hover:text-primary transition-colors`} />
                      </a>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-muted-foreground text-sm text-center md:text-left">
              © {currentYear} <span className="font-semibold text-foreground">{restaurantName}</span>. {copyrightText}
            </p>
            {links.length > 0 && (
              <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-sm">
                {links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium relative group"
                    target={link.url?.startsWith('http') ? '_blank' : '_self'}
                    rel={link.url?.startsWith('http') ? 'noopener noreferrer' : ''}
                  >
                    {link.text}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}

