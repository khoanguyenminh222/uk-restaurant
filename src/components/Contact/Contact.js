import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from "lucide-react"

export default function Contact() {
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
      icon: Facebook,
      href: "https://www.facebook.com/ukrestaurant",
      description: "Theo dõi chúng tôi trên Facebook",
      color: "text-blue-500",
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
      icon: Instagram,
      href: "https://www.instagram.com/ukrestaurant",
      description: "Xem hình ảnh món ăn trên Instagram",
      color: "text-pink-500",
    },
  ]

  // Google Maps embed URL - Thay đổi địa chỉ này theo địa chỉ thực tế của nhà hàng
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1234567890!2d106.6297!3d10.8231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ5JzIzLjIiTiAxMDbCsDM3JzQ2LjkiRQ!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"

  return (
    <section id="contact" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-50 mb-4">Liên hệ</h2>
          <div className="w-16 h-1 bg-green-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Hãy liên hệ với chúng tôi để được tư vấn và đặt món ngay hôm nay
          </p>
        </div>

        {/* Contact Card */}
        <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-sm hover:shadow-md hover:shadow-black/50 transition-all duration-300 mb-12">
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
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:shadow-black/50 transition-all duration-300">
            <div className="p-4 border-b border-gray-800">
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
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-sm hover:shadow-md hover:shadow-black/50 transition-all duration-300">
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
                    className="flex items-center gap-4 p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-green-500/50 hover:bg-gray-800/80 transition-all duration-300 group"
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
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">© 2025 UK Restaurant. Ăn no khỏi &ldquo;bàn&rdquo;</p>
        </div>
      </div>
    </section>
  )
}
