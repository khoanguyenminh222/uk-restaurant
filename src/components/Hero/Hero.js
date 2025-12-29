"use client"

export default function Hero() {
  const scrollToMenu = () => {
    const menuElement = document.getElementById("menu")
    if (menuElement) {
      const offset = 80
      const elementPosition = menuElement.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  const scrollToContact = () => {
    const contactElement = document.getElementById("contact")
    if (contactElement) {
      const offset = 80
      const elementPosition = contactElement.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <section
      id="home"
      className="relative pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-950/50 via-gray-950 to-gray-950"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-gray-50 mb-4 animate-fade-in-up text-balance">
            UK Restaurant
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl font-medium font-display text-gray-300 mb-8 animate-fade-in-up animation-delay-100">
            Ăn no khỏi &ldquo;bàn&rdquo;
          </p>

          {/* Description */}
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200 text-pretty">
            Khám phá hương vị đặc biệt với thực đơn đa dạng, nguyên liệu tươi ngon và dịch vụ tận tâm
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
            <button
              onClick={scrollToMenu}
              className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-950"
            >
              Xem thực đơn
            </button>
            <button
              onClick={scrollToContact}
              className="w-full sm:w-auto px-8 py-3 bg-transparent hover:bg-green-950/30 text-green-400 font-semibold rounded-lg border-2 border-green-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-950"
            >
              Liên hệ
            </button>
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  )
}

