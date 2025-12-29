import { CheckCircle2, Zap, Heart } from "lucide-react"

export default function About() {
  const features = [
    {
      icon: CheckCircle2,
      title: "Chất lượng",
      description: "Nguyên liệu tươi ngon, được chọn lọc kỹ càng từ những nhà cung cấp uy tín",
    },
    {
      icon: Zap,
      title: "Nhanh chóng",
      description: "Giao hàng nhanh chóng, đúng giờ như đã hứa với dịch vụ chuyên nghiệp",
    },
    {
      icon: Heart,
      title: "Tận tâm",
      description: "Phục vụ với sự nhiệt tình và chuyên nghiệp, luôn đặt khách hàng lên hàng đầu",
    },
  ]

  return (
    <section id="about" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-50 mb-4">Giới thiệu</h2>
          <div className="w-16 h-1 bg-green-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Cam kết mang đến cho bạn những trải nghiệm ẩm thực tuyệt vời nhất
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:shadow-md hover:shadow-black/50 hover:border-green-500/50 transition-all duration-300 group"
              >
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-4 bg-green-950/50 rounded-full flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-8 h-8" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold font-display text-gray-50 mb-2">{feature.title}</h3>

                {/* Description */}
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
