"use client"

import { useState, useEffect } from "react"
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { getCart, updateCartItem, removeFromCart, clearCart, getCartTotal, addToCart } from "@/utils/cart"
import { formatCurrency } from "@/utils/helpers"

export default function Cart({ isOpen, onClose, onCheckout }) {
  const [cart, setCart] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [removingItemId, setRemovingItemId] = useState(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(null)
  const [showConfirmClearCart, setShowConfirmClearCart] = useState(false)
  const [deletedItem, setDeletedItem] = useState(null)

  useEffect(() => {
    if (isOpen) {
      updateCart()
      // Prevent body scroll when cart is open
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleCartUpdate = () => {
      updateCart()
    }

    window.addEventListener("cartUpdated", handleCartUpdate)
    return () => window.removeEventListener("cartUpdated", handleCartUpdate)
  }, [])

  // Auto-hide undo toast after 5 seconds
  useEffect(() => {
    if (deletedItem) {
      const timer = setTimeout(() => {
        setDeletedItem(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [deletedItem])

  const updateCart = () => {
    setCart(getCart())
  }

  const handleIncreaseQuantity = (itemId) => {
    const item = cart.find((item) => item.id === itemId)
    if (item) {
      updateCartItem(itemId, item.quantity + 1)
      updateCart()
    }
  }

  const handleDecreaseQuantity = (itemId) => {
    const item = cart.find((item) => item.id === itemId)
    if (item && item.quantity > 1) {
      updateCartItem(itemId, item.quantity - 1)
      updateCart()
    }
  }

  const handleQuantityChange = (itemId, newQuantity) => {
    // Chuyển đổi sang số và validate
    const quantity = parseInt(newQuantity)
    if (!isNaN(quantity) && quantity > 0) {
      updateCartItem(itemId, quantity)
      updateCart()
    }
  }

  const handleQuantityBlur = (itemId, currentValue) => {
    const item = cart.find((item) => item.id === itemId)
    if (item) {
      const quantity = parseInt(currentValue)
      if (isNaN(quantity) || quantity < 1) {
        // Nếu không hợp lệ, reset về số lượng hiện tại
        updateCartItem(itemId, item.quantity)
        updateCart()
      }
    }
  }

  const handleRemoveItem = (itemId) => {
    const item = cart.find((item) => item.id === itemId)
    if (item) {
      setShowConfirmDelete(itemId)
    }
  }

  const confirmRemoveItem = (itemId) => {
    const item = cart.find((item) => item.id === itemId)
    if (item) {
      // Store deleted item for undo
      setDeletedItem({
        ...item,
        deletedAt: Date.now()
      })
      
      // Animate removal
      setRemovingItemId(itemId)
      setTimeout(() => {
        removeFromCart(itemId)
        updateCart()
        setRemovingItemId(null)
        setShowConfirmDelete(null)
      }, 300)
    }
  }

  const handleUndoDelete = () => {
    if (deletedItem) {
      addToCart({
        id: deletedItem.id,
        name: deletedItem.name,
        price: deletedItem.price,
        image: deletedItem.image,
        category_id: deletedItem.category_id,
        quantity: deletedItem.quantity,
      })
      updateCart()
      setDeletedItem(null)
      window.dispatchEvent(new CustomEvent("cartUpdated"))
    }
  }

  const handleClearCart = () => {
    setShowConfirmClearCart(true)
  }

  const confirmClearCart = () => {
    clearCart()
    updateCart()
    setShowConfirmClearCart(false)
    window.dispatchEvent(new CustomEvent("cartUpdated"))
  }

  const handleCheckout = () => {
    if (cart.length === 0) return
    onClose()
    if (onCheckout) {
      onCheckout(cart)
    }
  }

  const total = getCartTotal()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-sm bg-card shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 border-b border-border shrink-0">
          <h2 className="text-lg sm:text-xl font-bold font-display text-card-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <span className="truncate">Giỏ hàng</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors shrink-0 cursor-pointer"
            aria-label="Đóng giỏ hàng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 sm:py-6">
          {cart.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="w-20 h-20 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg mb-2">Giỏ hàng trống</p>
              <p className="text-muted-foreground text-sm">Thêm món ăn vào giỏ hàng để bắt đầu đặt hàng</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className={`bg-muted rounded-lg p-4 border border-border transition-all duration-300 ${
                    removingItemId === item.id 
                      ? "opacity-0 scale-95 -translate-x-full" 
                      : "opacity-100 scale-100 translate-x-0"
                  } ${
                    showConfirmDelete === item.id ? "ring-2 ring-destructive" : ""
                  }`}
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Image */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h3 className="text-base font-semibold text-card-foreground mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-primary font-bold text-sm mb-3">
                        {formatCurrency(item.price)} / món
                      </p>

                      {/* Quantity Controls and Total */}
                      <div className="flex flex-col gap-2 mt-auto">
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-card border border-border rounded-lg">
                            <button
                              onClick={() => handleDecreaseQuantity(item.id)}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer"
                              aria-label="Giảm số lượng"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              onBlur={(e) => handleQuantityBlur(item.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.target.blur()
                                }
                              }}
                              className="w-12 px-2 py-1 text-card-foreground font-medium text-center border-0 focus:outline-none focus:ring-0 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => handleIncreaseQuantity(item.id)}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer"
                              aria-label="Tăng số lượng"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1.5 text-destructive hover:text-destructive/80 hover:bg-muted rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group relative cursor-pointer"
                            aria-label="Xóa món"
                            title="Xóa món này"
                          >
                            <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                          </button>
                        </div>

                        {/* Total Price for this item */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Tổng:</span>
                          <span className="text-base font-bold text-primary">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation Dialog - Delete Item */}
        {showConfirmDelete && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirmDelete(null)}
          >
            <div 
              className="bg-card rounded-lg border border-border shadow-xl max-w-sm w-full p-6 animate-fade-in-scale"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Xác nhận xóa</h3>
              </div>
              <p className="text-card-foreground mb-6">
                Bạn có chắc muốn xóa <span className="font-semibold text-card-foreground">{cart.find(i => i.id === showConfirmDelete)?.name}</span> khỏi giỏ hàng?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDelete(null)}
                  className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={() => confirmRemoveItem(showConfirmDelete)}
                  className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog - Clear Cart */}
        {showConfirmClearCart && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirmClearCart(false)}
          >
            <div 
              className="bg-card rounded-lg border border-border shadow-xl max-w-sm w-full p-6 animate-fade-in-scale"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Xác nhận xóa giỏ hàng</h3>
              </div>
              <p className="text-card-foreground mb-6">
                Bạn có chắc muốn xóa <span className="font-semibold text-destructive">toàn bộ giỏ hàng</span>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmClearCart(false)}
                  className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmClearCart}
                  className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa tất cả
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Undo Toast */}
        {deletedItem && (
          <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-slide-in-right">
            <div className="bg-card border border-border rounded-lg shadow-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">Đã xóa khỏi giỏ hàng</p>
                  <p className="text-xs text-muted-foreground">{deletedItem.name}</p>
                </div>
              </div>
              <button
                onClick={handleUndoDelete}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap cursor-pointer"
              >
                Hoàn tác
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-border px-4 sm:px-6 py-4 sm:py-6 bg-muted shrink-0">
            {/* Total */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-card-foreground">Tổng cộng:</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(total)}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-lg transition-colors duration-300 shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                Thanh toán
              </button>
              <button
                onClick={handleClearCart}
                className="w-full px-6 py-2 bg-muted hover:bg-background text-card-foreground font-medium rounded-lg transition-colors duration-300 cursor-pointer"
              >
                Xóa giỏ hàng
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

