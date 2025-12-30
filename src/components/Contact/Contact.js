"use client"

import { Phone, Mail, MapPin, MessageCircle } from "lucide-react"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"

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
      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
      clipRule="evenodd"
    />
  </svg>
)

export default function Contact() {
  const [headerRef, isHeaderVisible] = useScrollAnimation({ threshold: 0.2 })
  const [contactCardRef, isContactCardVisible] = useScrollAnimation({ threshold: 0.2 })
  const [mapRef, isMapVisible] = useScrollAnimation({ threshold: 0.2 })
  const [socialRef, isSocialVisible] = useScrollAnimation({ threshold: 0.2 })

  const contactInfo = [
    {
      icon: Phone,
      title: "Điện thoại",
      value: "(+84) 096 960 6095",
      href: "tel:+84096960609",
    },
    {
      icon: Mail,
      title: "Email",
      value: "khoanguyenminh222@gmail.com",
      href: "mailto:khoanguyenminh222@gmail.com",
    },
    {
      icon: MapPin,
      title: "Địa chỉ",
      value: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
      href: null,
    },
  ]

  const socialMedia = [
    {
      name: "Facebook",
      icon: FacebookIcon,
      href: "https://www.facebook.com/ukrestaurant",
      description: "Theo dõi chúng tôi trên Facebook",
      color: "text-blue-400",
    },
    {
      name: "Zalo",
      icon: MessageCircle,
      href: "https://zalo.me/0969606095",
      description: "Chat với chúng tôi trên Zalo",
      color: "text-blue-400",
    },
    {
      name: "Instagram",
      icon: InstagramIcon,
      href: "https://www.instagram.com/ukrestaurant",
      description: "Xem hình ảnh món ăn trên Instagram",
      color: "text-pink-400",
    },
  ]

  // Google Maps embed URL - Thay đổi địa chỉ này theo địa chỉ thực tế của nhà hàng
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1234567890!2d106.6297!3d10.8231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ5JzIzLjIiTiAxMDbCsDM3JzQ2LjkiRQ!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"

  return (
    <section id="contact" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-12 scroll-fade-in ${isHeaderVisible ? "visible" : ""}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-50 mb-4">Liên hệ</h2>
          <div className="w-16 h-1 bg-green-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Hãy liên hệ với chúng tôi để được tư vấn và đặt món ngay hôm nay
          </p>
        </div>

        {/* Contact Card */}
        <div
          ref={contactCardRef}
          className={`max-w-2xl mx-auto bg-gray-950 border border-green-700 rounded-lg p-8 shadow-sm hover:shadow-md hover:shadow-black/50 transition-all duration-300 mb-12 scroll-fade-in ${isContactCardVisible ? "visible" : ""}`}
        >
          <div className="space-y-6">
            {contactInfo.map((item, index) => {
              const IconComponent = item.icon
              return (
                <div key={index} className="flex items-start gap-4">
                  {/* Icon Container */}
                  <div className="shrink-0 w-12 h-12 bg-green-950/50 rounded-lg flex items-center justify-center text-green-400">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Text Container */}
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-50 mb-1">{item.title}</h3>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-gray-400 hover:text-green-400 transition-colors duration-300 focus:outline-none focus:text-green-400"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-gray-400">{item.value}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Map and Social Media Section */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Google Maps */}
          <div
            ref={mapRef}
            className={`bg-gray-950 border border-green-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:shadow-black/50 transition-all duration-300 scroll-fade-in-left scroll-delay-100 ${isMapVisible ? "visible" : ""}`}
          >
            <div className="p-4 border-b border-green-700">
              <h3 className="text-lg font-semibold text-gray-50 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-400" />
                Vị trí của chúng tôi
              </h3>
            </div>
            <div className="relative w-full h-64 lg:h-80">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
                title="UK Restaurant Location"
              ></iframe>
            </div>
          </div>

          {/* Social Media */}
          <div
            ref={socialRef}
            className={`bg-gray-950 border border-green-700 rounded-lg p-8 shadow-sm hover:shadow-md hover:shadow-black/50 transition-all duration-300 scroll-fade-in-right scroll-delay-200 ${isSocialVisible ? "visible" : ""}`}
          >
            <h3 className="text-lg font-semibold text-gray-50 mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-400" />
              Kết nối với chúng tôi
            </h3>
            <div className="space-y-4">
              {socialMedia.map((social, index) => {
                const IconComponent = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gray-700/50 border border-gray-600 rounded-lg hover:border-green-500/50 hover:bg-gray-700 transition-all duration-300 group"
                  >
                    <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${social.color} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-50 mb-1">{social.name}</h4>
                      <p className="text-sm text-gray-400 group-hover:text-green-400 transition-colors duration-300">
                        {social.description}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                )
              })}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Cập nhật thông tin mới nhất về thực đơn, khuyến mãi và sự kiện đặc biệt
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">© 2025 UK Restaurant. Ăn no khỏi &ldquo;bàn&rdquo;</p>
        </div>
      </div>
    </section>
  )
}
