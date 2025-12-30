"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ShoppingCart, Utensils } from "lucide-react"
import { addToCart } from "@/utils/cart"
import { formatCurrency } from "@/utils/helpers"

export default function MenuCard({ food, onOrderClick, onAddToCart }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const buttonRef = useRef(null)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    
    // Trigger animation
    setIsAnimating(true)
    
    // Get button position for animation
    const buttonRect = buttonRef.current?.getBoundingClientRect()
    if (buttonRect && onAddToCart) {
      onAddToCart({
        food,
        position: {
          x: buttonRect.left + buttonRect.width / 2,
          y: buttonRect.top + buttonRect.height / 2,
        }
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

  return (
    <div className="group bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 hover:border-green-500/50 h-full flex flex-col cursor-pointer">
      {/* Image */}
      <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-700 shrink-0">
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
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <Utensils className="w-16 h-16 text-gray-600" />
          </div>
        )}
        {/* (Hiệu ứng chồm lên khi hover) */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5 flex flex-col grow">
        {/* Name */}
        <h3 className="text-lg md:text-xl font-semibold font-display text-gray-50 mb-2 line-clamp-1">
          {food.name}
        </h3>

        {/* Description */}
        {food.description ? (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2 grow">
            {food.description}
          </p>
        ) : (
          <div className="grow mb-3"></div>
        )}

        {/* Price and Actions */}
        <div className="flex flex-col gap-3 mt-auto">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-xl md:text-2xl font-bold text-green-400">
              {formatCurrency(food.price)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Add to Cart Button */}
            <button
              ref={buttonRef}
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                isAnimating ? "scale-95" : "hover:scale-105 active:scale-95"
              }`}
              aria-label={`Thêm ${food.name} vào giỏ hàng`}
            >
              <ShoppingCart className={`w-5 h-5 transition-transform ${isAnimating ? "scale-125 rotate-12" : ""}`} />
              <span className="text-sm">Thêm vào giỏ</span>
            </button>

            {/* Order Now Button (Optional) */}
            {onOrderClick && (
              <button
                onClick={handleOrderClick}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-50 rounded-lg text-sm font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
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

