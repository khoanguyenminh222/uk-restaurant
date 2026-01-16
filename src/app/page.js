export const runtime = 'edge';

"use client"

import { useState, useRef, useEffect } from "react"
import Hero from "@/components/Hero/Hero"
import Menu from "@/components/Menu/Menu"
import WhyChooseUs from "@/components/WhyChooseUs/WhyChooseUs"
import Testimonials from "@/components/Testimonials/Testimonials"
import ReviewForm from "@/components/ReviewForm/ReviewForm"
import { useLandingConfig } from "@/hooks/useLandingConfig"
import { useLayoutContext } from "@/contexts/LayoutContext"

export default function Home() {
  const { config } = useLandingConfig()
  const {
    openCart,
    openAuth,
    showToast,
    openUserProfile,
    openOrderHistory,
    openOrderForm
  } = useLayoutContext()

  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
  const [flyingItem, setFlyingItem] = useState(null)

  // Hàm helper để kiểm tra xem một section có được hiển thị không
  const isSectionVisible = (sectionId) => {
    // Nếu chưa load xong config, mặc định hiển thị
    if (!config || !config.header || !config.header.menu_items) return true;

    const menuItem = config.header.menu_items.find(item => item.id === sectionId);
    // Nếu không tìm thấy hoặc is_visible không phải false thì hiển thị
    return menuItem ? menuItem.is_visible !== false : true;
  };

  // Check for login/logout success messages
  useEffect(() => {
    const loginMessage = localStorage.getItem('login_success_message')
    const logoutMessage = localStorage.getItem('logout_success_message')

    if (loginMessage) {
      showToast(loginMessage, 'success')
      localStorage.removeItem('login_success_message')
    } else if (logoutMessage) {
      showToast(logoutMessage, 'success')
      localStorage.removeItem('logout_success_message')
    }
  }, [showToast])

  const handleAddToCart = ({ food, position }) => {
    // Show toast
    showToast(`Đã thêm "${food.name}" vào giỏ hàng`, 'success')

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
      setTimeout(() => {
        setFlyingItem(null)
        // openCart() // Removed: Don't open cart, let user decide
      }, 800)
    } else {
      // If cart icon not found, don't open cart immediately
      // openCart()
    }
  }

  const handleOrderNow = (food) => {
    // Use global OrderForm
    openOrderForm(food)
  }

  // Listen for toast events from other components if any (legacy support)
  useEffect(() => {
    const handleShowToast = (event) => {
      showToast(
        event.detail.message,
        event.detail.type || "success"
      )
    }

    window.addEventListener("showToast", handleShowToast)
    return () => window.removeEventListener("showToast", handleShowToast)
  }, [showToast])

  return (
    <div className="min-h-screen bg-background">
      {/* Header is now in ClientLayout */}

      <main>
        {isSectionVisible("home") && <Hero />}

        {isSectionVisible("menu") && (
          <Menu
            onAddToCart={handleAddToCart}
            onOrderClick={handleOrderNow}
            showToast={showToast}
            onAuthRequired={() => openAuth("login")}
          />
        )}

        {isSectionVisible("why-choose-us") && <WhyChooseUs />}

        {isSectionVisible("testimonials") && (
          <Testimonials onReviewFormClick={() => setIsReviewFormOpen(true)} />
        )}
      </main>

      {/* Footer, ScrollToTop, Cart, Auth, UserProfile, OrderHistory, Toast, OrderForm are now in ClientLayout */}

      <ReviewForm
        isOpen={isReviewFormOpen}
        onClose={() => setIsReviewFormOpen(false)}
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
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white overflow-hidden">
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

