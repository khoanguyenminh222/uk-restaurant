"use client"

import Header from "@/components/Header/Header"
import Hero from "@/components/Hero/Hero"
import Menu from "@/components/Menu/Menu"
import About from "@/components/About/About"
import Contact from "@/components/Contact/Contact"
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop"

export default function Home() {
  const handleCartClick = () => {
    // Handle cart click
    console.log("Cart clicked")
  }

  const handleLoginClick = () => {
    // Handle login click
    console.log("Login clicked")
  }

  const handleProfileClick = () => {
    // Handle profile click
    console.log("Profile clicked")
  }

  const handleOrderHistoryClick = () => {
    // Handle order history click
    console.log("Order history clicked")
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header 
        onCartClick={handleCartClick} 
        onLoginClick={handleLoginClick}
        onProfileClick={handleProfileClick}
        onOrderHistoryClick={handleOrderHistoryClick}
      />
      <main>
        <Hero />
        {/* Scroll Indicator */}
        <div className="relative flex justify-center py-8 bg-gray-950">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-green-500 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <Menu />
        <About />
        <Contact />
      </main>
      <ScrollToTop />
    </div>
  )
}
