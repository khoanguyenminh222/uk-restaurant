"use client"

import { useState, useEffect, useRef } from "react"
import { X, User, Phone, MapPin, FileText, ShoppingBag, Loader2, CheckCircle, Copy, ExternalLink } from "lucide-react"
import { getUser } from "@/utils/user"
import { getCustomerInfo, saveCustomerInfo } from "@/utils/customer"
import { clearCart, getCartTotal } from "@/utils/cart"
import { formatCurrency } from "@/utils/helpers"
import Image from "next/image"

export default function OrderForm({ isOpen, onClose, items = null, onSuccess }) {
  // items: null = từ cart, hoặc array items từ cart, hoặc single item object
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const modalRef = useRef(null)

  // Form state
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    notes: "",
  })

  // Validation errors
  const [errors, setErrors] = useState({})

  // Order items (từ cart hoặc single item)
  const [orderItems, setOrderItems] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalQuantity, setTotalQuantity] = useState(0)

  // Success state
  const [successOrder, setSuccessOrder] = useState(null)

  // Load items and calculate totals
  useEffect(() => {
    if (isOpen) {
      // Reset success state when opening modal
      setSuccessOrder(null)
      setError("")
      
      if (items === null) {
        // Load from cart
        const { getCart } = require("@/utils/cart")
        const cart = getCart()
        setOrderItems(cart)
        setTotalPrice(getCartTotal())
        setTotalQuantity(cart.reduce((sum, item) => sum + (item.quantity || 1), 0))
      } else if (Array.isArray(items)) {
        // Multiple items from cart
        setOrderItems(items)
        const total = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
        setTotalPrice(total)
        setTotalQuantity(items.reduce((sum, item) => sum + (item.quantity || 1), 0))
      } else {
        // Single item
        setOrderItems([items])
        setTotalPrice((items.price || 0) * (items.quantity || 1))
        setTotalQuantity(items.quantity || 1)
      }

      // Auto-fill form
      autoFillForm()
    }
  }, [isOpen, items])

  // Auto-fill form from user or localStorage
  const autoFillForm = async () => {
    const user = getUser()
    
    if (user) {
      // Fill from logged-in user
      setFormData({
        customer_name: user.name || "",
        customer_phone: user.phone || "",
        customer_address: user.address || "",
        notes: "",
      })
    } else {
      // Fill from localStorage (previous orders)
      const customerInfo = getCustomerInfo()
      if (customerInfo) {
        setFormData({
          customer_name: customerInfo.customer_name || "",
          customer_phone: customerInfo.customer_phone || "",
          customer_address: customerInfo.customer_address || "",
          notes: "",
        })
      }
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("showToast", {
              detail: {
                message: "Đã sao chép!",
                type: "success",
              },
            })
          )
        }
      })
    }
  }

  // Get track order URL
  const getTrackOrderUrl = () => {
    if (typeof window === "undefined" || !successOrder) return ""
    const baseUrl = window.location.origin
    return `${baseUrl}/track-order?order_id=${successOrder.order_id}`
  }

  // Handle close success screen
  const handleCloseSuccess = () => {
    setSuccessOrder(null)
    onClose()
  }

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  // Validate phone format (Vietnamese)
  const validatePhone = (phone) => {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
    return phoneRegex.test(phone.replace(/\s+/g, ""))
  }

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
    setError("")
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = "Tên người đặt là bắt buộc"
    } else if (formData.customer_name.trim().length < 2) {
      newErrors.customer_name = "Tên phải có ít nhất 2 ký tự"
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = "Số điện thoại là bắt buộc"
    } else if (!validatePhone(formData.customer_phone)) {
      newErrors.customer_phone = "Số điện thoại không hợp lệ (ví dụ: 0901234567)"
    }

    if (!formData.customer_address.trim()) {
      newErrors.customer_address = "Địa chỉ là bắt buộc"
    } else if (formData.customer_address.trim().length < 5) {
      newErrors.customer_address = "Địa chỉ phải có ít nhất 5 ký tự"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    if (orderItems.length === 0) {
      setError("Không có món nào để đặt")
      return
    }

    setLoading(true)

    try {
      const user = getUser()
      const user_id = user ? user.user_id : null

      // Prepare order data
      const orderData = {
        user_id: user_id,
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.replace(/\s+/g, ""),
        customer_address: formData.customer_address.trim(),
        notes: formData.notes.trim() || "",
        total_price: totalPrice,
        status: "pending",
      }

      // Add items based on order type
      if (orderItems.length === 1 && !Array.isArray(items)) {
        // Single item order
        const item = orderItems[0]
        orderData.món_id = item.id || item.food_id
        orderData.tên_món = item.name
        orderData.giá = item.price
        orderData.quantity = item.quantity || 1
        orderData.category_id = item.category_id
        orderData.category_name = item.category_name || ""
      } else {
        // Multiple items from cart
        orderData.items = orderItems.map((item) => ({
          món_id: item.id || item.food_id,
          tên_món: item.name,
          giá: item.price,
          quantity: item.quantity || 1,
          category_id: item.category_id,
          category_name: item.category_name || "",
        }))
      }

      // Submit order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (data.success) {
        // Save customer info to localStorage for next time
        saveCustomerInfo({
          customer_name: formData.customer_name.trim(),
          customer_phone: formData.customer_phone.replace(/\s+/g, ""),
          customer_address: formData.customer_address.trim(),
        })

        // Clear cart if checkout from cart
        if (items === null || Array.isArray(items)) {
          clearCart()
        }

        // Set success order data
        setSuccessOrder(data.data)

        // Call success callback
        if (onSuccess) {
          onSuccess(data.data)
        }

        // Show success message (could use toast here)
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("showToast", {
              detail: {
                message: "Đặt món thành công! Đơn hàng của bạn đang được xử lý.",
                type: "success",
              },
            })
          )
        }
      } else {
        setError(data.error || "Đặt món thất bại. Vui lòng thử lại sau.")
      }
    } catch (err) {
      console.error("Order error:", err)
      setError("Lỗi kết nối. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Success Screen
  if (successOrder) {
    const trackOrderUrl = getTrackOrderUrl()
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          ref={modalRef}
          className="relative w-full max-w-2xl bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden animate-fade-in-up"
        >
          {/* Close Button */}
          <button
            onClick={handleCloseSuccess}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors z-10"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Content */}
          <div className="p-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
            </div>

            {/* Success Title */}
            <h2 className="text-2xl font-bold text-gray-50 mb-2">Đặt món thành công!</h2>
            <p className="text-gray-400 mb-6">Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>

            {/* Order ID */}
            <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Mã đơn hàng của bạn</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-2xl font-mono font-bold text-green-400">{successOrder.order_id}</p>
                <button
                  onClick={() => copyToClipboard(successOrder.order_id)}
                  className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Sao chép mã đơn hàng"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Track Order Link */}
            <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-700">
              <p className="text-sm text-gray-400 mb-3">Theo dõi đơn hàng</p>
              <div className="flex items-center justify-center gap-3 mb-4">
                <a
                  href={trackOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 font-medium break-all text-sm"
                >
                  {trackOrderUrl}
                </a>
                <button
                  onClick={() => copyToClipboard(trackOrderUrl)}
                  className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors shrink-0"
                  title="Sao chép link"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <a
                href={trackOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Mở trang theo dõi đơn hàng
              </a>
            </div>

            {/* Info */}
            <p className="text-sm text-gray-400 mb-6">
              Chúng tôi đã gửi thông tin đơn hàng đến email của bạn (nếu bạn đã đăng nhập).
              <br />
              Bạn có thể sử dụng mã đơn hàng hoặc link trên để theo dõi trạng thái đơn hàng.
            </p>

            {/* Close Button */}
            <button
              onClick={handleCloseSuccess}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Order Form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors z-10"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-gray-800 bg-green-950/20 py-4 px-6">
          <h2 className="text-xl font-semibold text-gray-50 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-green-400" />
            Đặt món
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Order Summary */}
          <div className="mb-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Đơn hàng của bạn</h3>
            
            {/* Items List */}
            <div className="space-y-3 mb-4">
              {orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-3"
                >
                  {item.image && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-50 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(item.price)} × {item.quantity || 1}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-green-400 shrink-0">
                    {formatCurrency((item.price || 0) * (item.quantity || 1))}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-gray-700 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tổng số lượng:</span>
                <span className="text-gray-50 font-medium">{totalQuantity} món</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-50 font-semibold">Tổng tiền:</span>
                <span className="text-green-400 font-bold">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Name */}
            <div>
              <label htmlFor="customer_name" className="block text-sm font-medium text-gray-300 mb-2">
                Tên người đặt <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.customer_name ? "border-red-500" : "border-gray-700"
                  }`}
                />
              </div>
              {errors.customer_name && (
                <p className="mt-1 text-sm text-red-400">{errors.customer_name}</p>
              )}
            </div>

            {/* Customer Phone */}
            <div>
              <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-300 mb-2">
                Số điện thoại <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="customer_phone"
                  name="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.customer_phone ? "border-red-500" : "border-gray-700"
                  }`}
                />
              </div>
              {errors.customer_phone && (
                <p className="mt-1 text-sm text-red-400">{errors.customer_phone}</p>
              )}
            </div>

            {/* Customer Address */}
            <div>
              <label htmlFor="customer_address" className="block text-sm font-medium text-gray-300 mb-2">
                Địa chỉ giao hàng <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="customer_address"
                  name="customer_address"
                  type="text"
                  value={formData.customer_address}
                  onChange={handleChange}
                  placeholder="123 Đường ABC, Quận XYZ"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.customer_address ? "border-red-500" : "border-gray-700"
                  }`}
                />
              </div>
              {errors.customer_address && (
                <p className="mt-1 text-sm text-red-400">{errors.customer_address}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                Ghi chú <span className="text-gray-500 text-xs">(Tùy chọn)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Ghi chú thêm cho đơn hàng..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Đặt món ngay</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

