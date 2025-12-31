"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ShoppingCart, Utensils } from "lucide-react"
import { addToCart } from "@/utils/cart"
import { formatCurrency } from "@/utils/helpers"

export default function MenuCard({ food, onOrderClick, onAddToCart }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const buttonRef = useRef(null)
  const cardRef = useRef(null)

  const handleAddToCart = (e, useCardPosition = false) => {
    e.stopPropagation()
    
    // Trigger animation
    setIsAnimating(true)
    
    // Get position for animation (button or card)
    let position = null
    if (useCardPosition && cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect()
      position = {
        x: cardRect.left + cardRect.width / 2,
        y: cardRect.top + cardRect.height / 2,
      }
    } else if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      position = {
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2,
      }
    }
    
    if (position && onAddToCart) {
      onAddToCart({
        food,
        position
      })
    }
    
    addToCart({
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      category_id: food.category_id,
      quantity: 1,
    })
    
    // Reset animation after delay
    setTimeout(() => setIsAnimating(false), 600)
    
    // Update cart count
    window.dispatchEvent(new CustomEvent("cartUpdated"))
  }

  const handleOrderClick = (e) => {
    e.stopPropagation()
    if (onOrderClick) {
      onOrderClick(food)
    }
  }

  const handleCardClick = (e) => {
    // Chỉ thêm vào giỏ nếu click vào card, không phải vào button
    // Các button đã có stopPropagation nên sẽ không trigger event này
    if (e.target.closest('button')) {
      return
    }
    handleAddToCart(e, true)
  }

  return (
    <div 
      ref={cardRef}
      onClick={handleCardClick}
      className="group bg-card rounded-lg overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-1 border border-border hover:border-primary/50 h-full flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="relative w-full h-24 sm:h-28 md:h-32 overflow-hidden bg-muted shrink-0">
        {food.image ? (
          <Image
            src={food.image}
            alt={food.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Utensils className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        {/* (Hiệu ứng chồm lên khi hover) */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 flex flex-col grow">
        {/* Name */}
        <h3 className="text-sm sm:text-base font-semibold font-display text-card-foreground mb-1 line-clamp-1">
          {food.name}
        </h3>

        {/* Description - Ẩn trên mobile để tiết kiệm không gian */}
        {food.description && (
          <p className="hidden sm:block text-xs text-muted-foreground mb-2 line-clamp-2 grow">
            {food.description}
          </p>
        )}

        {/* Price and Actions */}
        <div className="flex flex-col gap-1.5 sm:gap-2 mt-auto">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-bold text-primary">
              {formatCurrency(food.price)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-stretch gap-1.5 sm:gap-2">
            {/* Add to Cart Button */}
            <button
              ref={buttonRef}
              onClick={handleAddToCart}
              className={`flex-1 cursor-pointer flex items-center justify-center gap-1 px-2 py-1.5 sm:py-2 min-h-[32px] sm:min-h-[36px] bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background whitespace-nowrap ${
                isAnimating ? "scale-95" : "hover:scale-105 active:scale-95"
              }`}
              aria-label={`Thêm ${food.name} vào giỏ hàng`}
            >
              <ShoppingCart className={`hidden sm:block w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isAnimating ? "scale-125 rotate-12" : ""}`} />
              <span>Thêm</span>
            </button>

            {/* Order Now Button (Optional) */}
            {onOrderClick && (
              <button
                onClick={handleOrderClick}
                className="flex-1 px-2 py-1.5 sm:py-2 min-h-[32px] sm:min-h-[36px] bg-muted hover:bg-muted/80 text-card-foreground rounded-lg text-xs font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background whitespace-nowrap cursor-pointer"
              >
                Đặt ngay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

