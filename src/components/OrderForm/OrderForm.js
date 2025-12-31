"use client"

import { useState, useEffect, useRef } from "react"
import { X, User, Phone, MapPin, FileText, ShoppingBag, Loader2, CheckCircle, Copy, ExternalLink, History, XCircle } from "lucide-react"
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
  const [cancelling, setCancelling] = useState(false)

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

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!successOrder || successOrder.status !== 'pending') {
      return
    }

    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return
    }

    setCancelling(true)
    try {
      const response = await fetch(`/api/orders/${successOrder.order_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
          changed_by: 'customer',
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update success order status
        setSuccessOrder({ ...successOrder, status: 'cancelled' })
        
        // Show success message
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("showToast", {
              detail: {
                message: "Đã hủy đơn hàng thành công!",
                type: "success",
              },
            })
          )
        }
      } else {
        setError(data.error || 'Không thể hủy đơn hàng')
      }
    } catch (err) {
      console.error('Error cancelling order:', err)
      setError('Lỗi khi hủy đơn hàng')
    } finally {
      setCancelling(false)
    }
  }

  // Get order history URL
  const getOrderHistoryUrl = () => {
    if (typeof window === "undefined" || !successOrder) return ""
    const baseUrl = window.location.origin
    return `${baseUrl}/track-order?order_id=${successOrder.order_id}`
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
          className="relative w-full max-w-2xl bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-fade-in-up"
        >
          {/* Close Button */}
          <button
            onClick={handleCloseSuccess}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors z-10"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Content */}
          <div className="p-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
            </div>

            {/* Success Title */}
            <h2 className="text-2xl font-bold text-card-foreground mb-2">Đặt món thành công!</h2>
            <p className="text-muted-foreground mb-6">Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>

            {/* Order ID */}
            <div className="bg-muted rounded-lg p-6 mb-6 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Mã đơn hàng của bạn</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-2xl font-mono font-bold text-primary">{successOrder.order_id}</p>
                <button
                  onClick={() => copyToClipboard(successOrder.order_id)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                  title="Sao chép mã đơn hàng"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Track Order Link */}
            <div className="bg-muted rounded-lg p-6 mb-6 border border-border">
              <p className="text-sm text-muted-foreground mb-3">Theo dõi đơn hàng</p>
              <div className="flex items-center justify-center gap-3 mb-4">
                <a
                  href={trackOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-light font-medium break-all text-sm"
                >
                  {trackOrderUrl}
                </a>
                <button
                  onClick={() => copyToClipboard(trackOrderUrl)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors shrink-0"
                  title="Sao chép link"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <a
                href={trackOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-lg transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Mở trang theo dõi đơn hàng
              </a>
            </div>

            {/* Order History Link */}
            <div className="bg-muted rounded-lg p-6 mb-6 border border-border">
              <p className="text-sm text-muted-foreground mb-3">Xem lịch sử đơn hàng</p>
              <a
                href={getOrderHistoryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-lg transition-colors"
              >
                <History className="w-5 h-5" />
                Xem lịch sử đơn hàng
              </a>
            </div>

            {/* Cancel Order Button (only if status is pending) */}
            {successOrder.status === 'pending' && (
              <div className="mb-6">
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="w-full py-3 bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang hủy...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span>Hủy đơn hàng</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Status Badge */}
            {successOrder.status === 'cancelled' && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                <p className="text-destructive font-medium">Đơn hàng đã được hủy</p>
              </div>
            )}

            {/* Info */}
            <p className="text-sm text-muted-foreground mb-6">
              Chúng tôi đã gửi thông tin đơn hàng đến email của bạn (nếu bạn đã đăng nhập).
              <br />
              Bạn có thể sử dụng mã đơn hàng hoặc link trên để theo dõi trạng thái đơn hàng.
            </p>

            {/* Close Button */}
            <button
              onClick={handleCloseSuccess}
              className="w-full py-3 bg-muted hover:bg-muted/80 text-card-foreground font-semibold rounded-lg transition-colors"
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
        className="relative w-full max-w-2xl bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors z-10"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-border bg-primary/10 py-4 px-6">
          <h2 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Đặt món
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm">
              {error}
              <button
                onClick={() => setError("")}
                className="ml-2 text-destructive hover:text-destructive/80"
              >
                <X className="w-4 h-4 inline" />
              </button>
            </div>
          )}

          {/* Order Summary */}
          <div className="mb-6 bg-muted rounded-lg p-4 border border-border">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Đơn hàng của bạn</h3>
            
            {/* Items List */}
            <div className="space-y-3 mb-4">
              {orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-card rounded-lg p-3"
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
                    <p className="text-sm font-medium text-card-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} × {item.quantity || 1}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary shrink-0">
                    {formatCurrency((item.price || 0) * (item.quantity || 1))}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng số lượng:</span>
                <span className="text-card-foreground font-medium">{totalQuantity} món</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-card-foreground font-semibold">Tổng tiền:</span>
                <span className="text-primary font-bold">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Name */}
            <div>
              <label htmlFor="customer_name" className="block text-sm font-medium text-card-foreground mb-2">
                Tên người đặt <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className={`w-full pl-10 pr-4 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.customer_name ? "border-destructive" : "border-border"
                  }`}
                />
              </div>
              {errors.customer_name && (
                <p className="mt-1 text-sm text-destructive">{errors.customer_name}</p>
              )}
            </div>

            {/* Customer Phone */}
            <div>
              <label htmlFor="customer_phone" className="block text-sm font-medium text-card-foreground mb-2">
                Số điện thoại <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="customer_phone"
                  name="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  className={`w-full pl-10 pr-4 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.customer_phone ? "border-destructive" : "border-border"
                  }`}
                />
              </div>
              {errors.customer_phone && (
                <p className="mt-1 text-sm text-destructive">{errors.customer_phone}</p>
              )}
            </div>

            {/* Customer Address */}
            <div>
              <label htmlFor="customer_address" className="block text-sm font-medium text-card-foreground mb-2">
                Địa chỉ giao hàng <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="customer_address"
                  name="customer_address"
                  type="text"
                  value={formData.customer_address}
                  onChange={handleChange}
                  placeholder="123 Đường ABC, Quận XYZ"
                  className={`w-full pl-10 pr-4 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.customer_address ? "border-destructive" : "border-border"
                  }`}
                />
              </div>
              {errors.customer_address && (
                <p className="mt-1 text-sm text-destructive">{errors.customer_address}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-card-foreground mb-2">
                Ghi chú <span className="text-muted-foreground text-xs">(Tùy chọn)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Ghi chú thêm cho đơn hàng..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

