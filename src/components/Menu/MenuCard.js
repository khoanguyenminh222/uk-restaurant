"use client"

import Image from "next/image"
import { ShoppingCart, Utensils } from "lucide-react"
import { addToCart } from "@/utils/cart"
import { formatCurrency } from "@/utils/helpers"

export default function MenuCard({ food, onOrderClick }) {
  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart({
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      category_id: food.category_id,
      quantity: 1,
    })
    // (Cập nhật số lượng món trong giỏ hàng)
    window.dispatchEvent(new CustomEvent("cartUpdated"))
  }

  const handleOrderClick = (e) => {
    e.stopPropagation()
    if (onOrderClick) {
      onOrderClick(food)
    }
  }

  return (
    <div className="group bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 hover:border-green-500/50">
      {/* Image */}
      <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-700">
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
      <div className="p-4 md:p-5">
        {/* Name */}
        <h3 className="text-lg md:text-xl font-semibold font-display text-gray-50 mb-2 line-clamp-1">
          {food.name}
        </h3>

        {/* Description */}
        {food.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2 min-h-10">
            {food.description}
          </p>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl md:text-2xl font-bold text-green-400">
            {formatCurrency(food.price)}
          </span>

          <div className="flex items-center gap-2">
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label={`Thêm ${food.name} vào giỏ hàng`}
            >
              <ShoppingCart className="w-5 h-5" />
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

