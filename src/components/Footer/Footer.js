"use client"

import { Utensils } from "lucide-react"
import { useLandingConfig } from "@/hooks/useLandingConfig"

export default function Footer() {
  const { config } = useLandingConfig()
  const footerConfig = config?.footer || {}
  const restaurantName = footerConfig.restaurant_name || 'UK Restaurant'
  const slogan = footerConfig.slogan || 'Ăn no khỏi "bàn"'
  const description = footerConfig.description || 'Khám phá hương vị đặc biệt với thực đơn đa dạng, nguyên liệu tươi ngon và dịch vụ tận tâm.'
  const copyrightText = footerConfig.copyright_text || 'Tất cả quyền được bảo lưu.'
  const links = footerConfig.links || []
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Brand Section */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <Utensils className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold font-display text-foreground">{restaurantName}</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {slogan}
          </p>
          <p className="text-muted-foreground text-sm">
            {description}
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm text-center md:text-left">
              © {currentYear} {restaurantName}. {copyrightText}
            </p>
            {links.length > 0 && (
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {links.map((link, index) => (
                  <a key={index} href={link.url} className="hover:text-primary transition-colors">
                    {link.text}
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

