"use client"

import { useState, useRef } from "react"
import Header from "@/components/Header/Header"
import Hero from "@/components/Hero/Hero"
import Menu from "@/components/Menu/Menu"
import About from "@/components/About/About"
import Contact from "@/components/Contact/Contact"
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop"
import Cart from "@/components/Cart/Cart"
import Toast from "@/components/Toast/Toast"

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [toast, setToast] = useState({ message: "", isVisible: false })
  const cartIconRef = useRef(null)
  const [flyingItem, setFlyingItem] = useState(null)

  const handleCartClick = () => {
    setIsCartOpen(true)
  }

  const handleAddToCart = ({ food, position }) => {
    // Show toast
    setToast({
      message: `Đã thêm "${food.name}" vào giỏ hàng`,
      isVisible: true,
    })

    // Get cart icon position
    const cartIcon = document.querySelector('[aria-label*="Giỏ hàng"]')
    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect()
      const cartPosition = {
        x: cartRect.left + cartRect.width / 2,
        y: cartRect.top + cartRect.height / 2,
      }

      // Calculate transform values
      const deltaX = cartPosition.x - position.x
      const deltaY = cartPosition.y - position.y

      // Create flying animation
      setFlyingItem({
        start: position,
        end: cartPosition,
        deltaX,
        deltaY,
        image: food.image,
        name: food.name,
      })

      // Remove flying item after animation
      setTimeout(() => setFlyingItem(null), 800)
    }
  }

  const handleCloseToast = () => {
    setToast({ ...toast, isVisible: false })
  }

  const handleCartClose = () => {
    setIsCartOpen(false)
  }

  const handleCheckout = (cart) => {
    // TODO: Mở Order Form Modal với cart items
    console.log("Checkout with cart:", cart)
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
        <Menu onAddToCart={handleAddToCart} />
        <About />
        <Contact />
      </main>
      <ScrollToTop />
      <Cart isOpen={isCartOpen} onClose={handleCartClose} onCheckout={handleCheckout} />
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={handleCloseToast}
        type="success"
      />
      
      {/* Flying Item Animation */}
      {flyingItem && (
        <div
          className="fixed z-50 pointer-events-none flying-item"
          style={{
            left: `${flyingItem.start.x}px`,
            top: `${flyingItem.start.y}px`,
            transform: `translate(0, 0) scale(1)`,
            opacity: 1,
            animation: `flyToCart 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
            '--delta-x': `${flyingItem.deltaX}px`,
            '--delta-y': `${flyingItem.deltaY}px`,
          }}
        >
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg border-2 border-white overflow-hidden">
            {flyingItem.image ? (
              <img
                src={flyingItem.image}
                alt={flyingItem.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-white text-xl">🍽️</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
