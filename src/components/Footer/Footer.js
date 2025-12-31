"use client"

import { Utensils } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Brand Section */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <Utensils className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold font-display text-foreground">UK Restaurant</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Ăn no khỏi &ldquo;bàn&rdquo;
          </p>
          <p className="text-muted-foreground text-sm">
            Khám phá hương vị đặc biệt với thực đơn đa dạng, nguyên liệu tươi ngon và dịch vụ tận tâm.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm text-center md:text-left">
              © {currentYear} UK Restaurant. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Điều khoản sử dụng
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

