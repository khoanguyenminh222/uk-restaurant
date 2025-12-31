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
      className="relative pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8"
      style={{
        background: `linear-gradient(to bottom, var(--hero-gradient-from), var(--hero-gradient-via), var(--hero-gradient-to))`
      }}
    >
      <div className="max-w-7xl mx-auto overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground mb-4 animate-fade-in-up text-balance">
            UK Restaurant
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl font-medium font-display text-foreground mb-8 animate-fade-in-up animation-delay-100">
            Ăn no khỏi &ldquo;bàn&rdquo;
          </p>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200 text-pretty">
            Khám phá hương vị đặc biệt với thực đơn đa dạng, nguyên liệu tươi ngon và dịch vụ tận tâm
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
            <button
              onClick={scrollToMenu}
              className="w-full sm:w-auto px-8 py-3 cursor-pointer bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-lg shadow-md hover:shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              Xem thực đơn
            </button>
            <button
              onClick={scrollToContact}
              className="w-full sm:w-auto px-8 py-3 cursor-pointer bg-card hover:bg-muted text-primary border-2 border-primary font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              Liên hệ
            </button>
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  )
}

