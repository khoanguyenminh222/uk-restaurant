"use client"

import { useState, useEffect, useRef } from "react"
import { X, User, Phone, MapPin, FileText, ShoppingBag, Loader2, CheckCircle, Copy, ExternalLink, History, XCircle, Mail, ShieldCheck } from "lucide-react"
import { getUser } from "@/utils/user"
import { userFetch } from "@/lib/userAuth"
import { getCustomerInfo, saveCustomerInfo } from "@/utils/customer"
import { clearCart, getCartTotal } from "@/utils/cart"
import { formatCurrency } from "@/utils/helpers"
import Image from "next/image"

export default function OrderForm({ isOpen, onClose, items = null, onSuccess }) {
  // Verified session TTL state (lấy từ API)
  const [verifiedSessionTTL, setVerifiedSessionTTL] = useState(1800 * 1000) // Default 30 phút (ms)
  // items: null = từ cart, hoặc array items từ cart, hoặc single item object
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const modalRef = useRef(null)

  // Form state
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    notes: "",
  })

  // Email verification state
  const [emailVerification, setEmailVerification] = useState({
    step: 'input', // 'input' | 'send_code' | 'verify_code' | 'verified'
    code: "",
    sendingCode: false,
    verifyingCode: false,
    error: "",
    verified: false,
  })

  // Validation errors
  const [errors, setErrors] = useState({})

  // Fetch spam config from API (chỉ fetch 1 lần khi component mount)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config/spam')
        const data = await response.json()
        if (data.success && data.data.verified_session_ttl) {
          // Lấy từ API và convert từ giây sang milliseconds
          const ttlSeconds = data.data.verified_session_ttl
          setVerifiedSessionTTL(ttlSeconds * 1000)
          //console.log('✅ Đã lấy config từ API:', { verified_session_ttl: ttlSeconds, verified_session_ttl_ms: ttlSeconds * 1000 })
        } else {
          console.warn('⚠️ API không trả về verified_session_ttl, dùng default:', 1800 * 1000)
        }
      } catch (err) {
        console.error('❌ Lỗi khi fetch config từ API:', err)
        console.warn('⚠️ Dùng default value:', 1800 * 1000, 'ms (30 phút)')
        // Keep default value (1800 * 1000 = 30 phút)
      }
    }
    fetchConfig()
  }, [])

  // Check verification expiry định kỳ (mỗi 1 phút)
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      if (emailVerification.verified && formData.customer_email && typeof window !== "undefined") {
        const verifiedEmails = JSON.parse(localStorage.getItem('verified_emails') || '{}')
        const emailKey = formData.customer_email.trim().toLowerCase()
        const verifiedInfo = verifiedEmails[emailKey]

        if (verifiedInfo && verifiedInfo.expiresAt) {
          const expiresAt = new Date(verifiedInfo.expiresAt)
          const now = new Date()

          if (now >= expiresAt) {
            // Đã hết hạn, reset verification state
            setEmailVerification({
              step: 'input',
              code: "",
              sendingCode: false,
              verifyingCode: false,
              error: "",
              verified: false,
            })
            // Xóa khỏi localStorage
            delete verifiedEmails[emailKey]
            localStorage.setItem('verified_emails', JSON.stringify(verifiedEmails))
            //console.log(`[Email Verification] ⏰ Session đã hết hạn cho email: ${emailKey}`)
          }
        }
      }
    }, 60000) // Check mỗi 1 phút

    return () => clearInterval(interval)
  }, [isOpen, emailVerification.verified, formData.customer_email])

  // Order items (từ cart hoặc single item)
  const [orderItems, setOrderItems] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalQuantity, setTotalQuantity] = useState(0)

  // Success state
  const [successOrder, setSuccessOrder] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Check và reset verification state nếu hết hạn
  const checkVerificationExpiry = () => {
    if (emailVerification.verified && formData.customer_email && typeof window !== "undefined") {
      const verifiedEmails = JSON.parse(localStorage.getItem('verified_emails') || '{}')
      const emailKey = formData.customer_email.trim().toLowerCase()
      const verifiedInfo = verifiedEmails[emailKey]

      if (verifiedInfo && verifiedInfo.expiresAt) {
        const expiresAt = new Date(verifiedInfo.expiresAt)
        const now = new Date()

        if (now >= expiresAt) {
          // Đã hết hạn, reset verification state
          setEmailVerification({
            step: 'input',
            code: "",
            sendingCode: false,
            verifyingCode: false,
            error: "",
            verified: false,
          })
          // Xóa khỏi localStorage
          delete verifiedEmails[emailKey]
          localStorage.setItem('verified_emails', JSON.stringify(verifiedEmails))
          //console.log(`[Email Verification] ⏰ Session đã hết hạn cho email: ${emailKey}`)
        }
      }
    }
  }

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

      // Check verification expiry khi mở modal
      checkVerificationExpiry()
    }
  }, [isOpen, items])

  // Auto-fill form from user or localStorage
  const autoFillForm = async () => {
    const user = getUser()

    if (user) {
      // Fill from logged-in user
      const email = user.email || ""
      setFormData({
        customer_name: user.name || "",
        customer_phone: user.phone || "",
        customer_email: email,
        customer_address: user.address || "",
        notes: "",
      })

      // Tự động xác thực email cho user/admin đã login
      if (email && typeof window !== "undefined") {
        // Kiểm tra xem user có phải admin/manager/super_admin không
        const isAdmin = user.role && ['admin', 'manager', 'super_admin'].includes(user.role)

        // Nếu là user thường hoặc admin đã login, tự động mark as verified
        // Lưu vào localStorage với thời gian hết hạn dài (30 ngày cho user đã login)
        const verifiedEmails = JSON.parse(localStorage.getItem('verified_emails') || '{}')
        const emailKey = email.toLowerCase().trim()
        const expiresAt = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 ngày

        verifiedEmails[emailKey] = {
          verified: true,
          verifiedAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
          autoVerified: true, // Đánh dấu là tự động verify (không cần code)
        }
        localStorage.setItem('verified_emails', JSON.stringify(verifiedEmails))

        // Mark as verified trong state
        setEmailVerification(prev => ({
          ...prev,
          verified: true,
          step: 'verified',
          error: ""
        }))

        //console.log(`[Email Verification] ✅ Tự động xác thực email cho user đã login: ${emailKey}${isAdmin ? ` (${user.role})` : ''}`)
      }
    } else {
      // Fill from localStorage (previous orders)
      const customerInfo = getCustomerInfo()
      if (customerInfo) {
        const email = customerInfo.customer_email || ""
        setFormData({
          customer_name: customerInfo.customer_name || "",
          customer_phone: customerInfo.customer_phone || "",
          customer_email: email,
          customer_address: customerInfo.customer_address || "",
          notes: "",
        })

        // Kiểm tra xem email có đã verified trong localStorage không
        if (email && typeof window !== "undefined") {
          const verifiedEmails = JSON.parse(localStorage.getItem('verified_emails') || '{}')
          const emailKey = email.toLowerCase().trim()
          const verifiedInfo = verifiedEmails[emailKey]

          if (verifiedInfo && verifiedInfo.verified) {
            // Kiểm tra xem có hết hạn không (theo VERIFIED_SESSION_TTL)
            const expiresAt = new Date(verifiedInfo.expiresAt)
            const now = new Date()

            if (now < expiresAt) {
              // Email vẫn còn hiệu lực, mark as verified
              setEmailVerification(prev => ({
                ...prev,
                verified: true,
                step: 'verified'
              }))
            } else {
              // Đã hết hạn, xóa khỏi localStorage
              delete verifiedEmails[emailKey]
              localStorage.setItem('verified_emails', JSON.stringify(verifiedEmails))
            }
          }
        }
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
    setShowCancelConfirm(false)
    onClose()
  }

  // Handle cancel order click - mở modal xác nhận
  const handleCancelClick = () => {
    if (!successOrder || successOrder.status !== 'pending') {
      return
    }
    setShowCancelConfirm(true)
  }

  // Xác nhận hủy đơn hàng
  const handleConfirmCancel = async () => {
    if (!successOrder || successOrder.status !== 'pending') {
      return
    }

    setShowCancelConfirm(false)
    setCancelling(true)
    try {
      // Check if user is logged in
      const user = getUser();
      const isLoggedIn = user && user.user_id;

      let response;
      if (isLoggedIn) {
        // Use authenticated userFetch for logged in users
        response = await userFetch(`/api/orders/${successOrder.order_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'cancelled',
            changed_by: 'user', // will be overridden by backend based on token
            cancel_reason: cancelReason.trim() || '',
          }),
        })
      } else {
        // Use regular fetch for guests, but provide verification info
        // We use the info from successOrder to verify ownership
        response = await fetch(`/api/orders/${successOrder.order_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'cancelled',
            changed_by: 'customer',
            cancel_reason: cancelReason.trim() || '',
            // Security verification for guest orders
            customer_email: successOrder.customer_email || formData.customer_email,
            customer_phone: successOrder.customer_phone || formData.customer_phone,
            customer_name: successOrder.customer_name || formData.customer_name,
          }),
        })
      }

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

  // Hủy bỏ modal xác nhận
  const handleCancelCancel = () => {
    setShowCancelConfirm(false)
    setCancelReason('')
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
    // Ensure value is always a string, never undefined
    setFormData((prev) => ({ ...prev, [name]: value || "" }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
    setError("")
  }

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
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

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = "Email là bắt buộc"
    } else if (!validateEmail(formData.customer_email)) {
      newErrors.customer_email = "Email không hợp lệ"
    } else {
      // Kiểm tra xem user có đang login không
      const user = getUser()
      const isLoggedIn = user && user.user_id

      // Nếu user đã login, không cần verify email (API sẽ tự động skip)
      // Nếu user chưa login, cần verify email
      if (!isLoggedIn && !emailVerification.verified) {
        newErrors.customer_email = "Email chưa được xác thực"
      }
    }

    if (!formData.customer_address.trim()) {
      newErrors.customer_address = "Địa chỉ là bắt buộc"
    } else if (formData.customer_address.trim().length < 5) {
      newErrors.customer_address = "Địa chỉ phải có ít nhất 5 ký tự"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Send verification code
  const handleSendVerificationCode = async () => {
    if (!formData.customer_email.trim()) {
      setErrors(prev => ({ ...prev, customer_email: "Email là bắt buộc" }))
      return
    }

    if (!validateEmail(formData.customer_email)) {
      setErrors(prev => ({ ...prev, customer_email: "Email không hợp lệ" }))
      return
    }

    setEmailVerification(prev => ({ ...prev, sendingCode: true, error: "" }))

    try {
      const response = await fetch("/api/orders/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.customer_email.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setEmailVerification(prev => ({ ...prev, step: 'verify_code', sendingCode: false }))
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("showToast", {
              detail: {
                message: "Mã xác thực đã được gửi đến email của bạn.",
                type: "success",
              },
            })
          )
        }
      } else {
        setEmailVerification(prev => ({
          ...prev,
          sendingCode: false,
          error: data.error || "Không thể gửi mã xác thực"
        }))
        if (data.error_code === 'BLACKLISTED') {
          setErrors(prev => ({ ...prev, customer_email: data.error }))
        }
      }
    } catch (err) {
      console.error("Error sending verification code:", err)
      setEmailVerification(prev => ({
        ...prev,
        sendingCode: false,
        error: "Lỗi kết nối. Vui lòng thử lại sau."
      }))
    }
  }

  // Verify email code
  const handleVerifyEmailCode = async () => {
    if (!emailVerification.code.trim() || emailVerification.code.length !== 6) {
      setEmailVerification(prev => ({ ...prev, error: "Mã xác thực phải là 6 chữ số" }))
      return
    }

    setEmailVerification(prev => ({ ...prev, verifyingCode: true, error: "" }))

    try {
      const response = await fetch("/api/orders/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.customer_email.trim(),
          code: emailVerification.code.trim()
        }),
      })

      const data = await response.json()

      if (data.success) {
        setEmailVerification(prev => ({
          ...prev,
          verified: true,
          step: 'verified',
          verifyingCode: false,
          error: ""
        }))

        // Lưu email đã verified vào localStorage để dùng cho lần sau
        if (typeof window !== "undefined") {
          const verifiedEmails = JSON.parse(localStorage.getItem('verified_emails') || '{}')
          verifiedEmails[formData.customer_email.trim().toLowerCase()] = {
            verified: true,
            verifiedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + verifiedSessionTTL).toISOString()
          }
          localStorage.setItem('verified_emails', JSON.stringify(verifiedEmails))

          window.dispatchEvent(
            new CustomEvent("showToast", {
              detail: {
                message: "Email đã được xác thực thành công!",
                type: "success",
              },
            })
          )
          setErrors({ ...errors, customer_email: "" })
        }
      } else {
        setEmailVerification(prev => ({
          ...prev,
          verifyingCode: false,
          error: data.error || "Mã xác thực không đúng"
        }))
      }
    } catch (err) {
      console.error("Error verifying email:", err)
      setEmailVerification(prev => ({
        ...prev,
        verifyingCode: false,
        error: "Lỗi kết nối. Vui lòng thử lại sau."
      }))
    }
  }

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    if (orderItems.length === 0) {
      setError("Không có sản phẩm nào để đặt")
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
        customer_email: formData.customer_email.trim().toLowerCase(),
        customer_address: formData.customer_address.trim(),
        notes: formData.notes.trim() || "",
        total_price: totalPrice,
        status: "pending",
      }

      // Luôn dùng items array (kể cả khi chỉ có 1 món)
      orderData.items = orderItems.map((item) => ({
        food_id: item.id || item.food_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        category_id: item.category_id,
        category_name: item.category_name || "",
      }))

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
          customer_email: formData.customer_email.trim().toLowerCase(),
          customer_address: formData.customer_address.trim(),
        })

        // Lưu email đã verified vào localStorage (nếu đã verified)
        if (emailVerification.verified && formData.customer_email && typeof window !== "undefined") {
          const verifiedEmails = JSON.parse(localStorage.getItem('verified_emails') || '{}')
          const emailKey = formData.customer_email.trim().toLowerCase()
          verifiedEmails[emailKey] = {
            verified: true,
            verifiedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + verifiedSessionTTL).toISOString()
          }
          localStorage.setItem('verified_emails', JSON.stringify(verifiedEmails))
        }

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
                message: "Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.",
                type: "success",
              },
            })
          )
        }
      } else {
        setError(data.error || "Đặt hàng thất bại. Vui lòng thử lại sau.")
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
      <>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
          <div
            ref={modalRef}
            className="relative w-full max-w-2xl bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-fade-in-up max-h-[95vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={handleCloseSuccess}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors z-10 cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Success Content */}
            <div className="p-4 sm:p-6 md:p-8 text-center">
              {/* Success Icon */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                </div>
              </div>

              {/* Success Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-2">Đặt hàng thành công!</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-2">
                Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
              </p>

              {/* Order ID */}
              <div className="bg-muted rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-border">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Mã đơn hàng của bạn</p>
                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                  <p className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-primary break-all">
                    {successOrder.order_id}
                  </p>
                  <button
                    onClick={() => copyToClipboard(successOrder.order_id)}
                    className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Sao chép mã đơn hàng"
                  >
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Track Order Link */}
              <div className="bg-muted rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-border">
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">Theo dõi đơn hàng</p>
                <div className="flex items-start sm:items-center justify-center gap-2 sm:gap-3 mb-4 flex-wrap">
                  <a
                    href={trackOrderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-light font-medium break-all text-xs sm:text-sm flex-1 min-w-0"
                  >
                    {trackOrderUrl}
                  </a>
                  <button
                    onClick={() => copyToClipboard(trackOrderUrl)}
                    className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="Sao chép link"
                  >
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <a
                  href={trackOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="whitespace-nowrap">Mở trang theo dõi đơn hàng</span>
                </a>
              </div>

              {/* Order History Link */}
              <div className="bg-muted rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-border">
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">Xem lịch sử đơn hàng</p>
                <a
                  href={getOrderHistoryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  <History className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="whitespace-nowrap">Xem lịch sử đơn hàng</span>
                </a>
              </div>

              {/* Cancel Order Button (only if status is pending) */}
              {successOrder.status === 'pending' && (
                <div className="mb-4 sm:mb-6 cursor-pointer">
                  <button
                    onClick={handleCancelClick}
                    disabled={cancelling}
                    className="w-full py-2.5 sm:py-3 bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span>Đang hủy...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Hủy đơn hàng</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Status Badge */}
              {successOrder.status === 'cancelled' && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                  <p className="text-destructive font-medium text-sm sm:text-base">Đơn hàng đã được hủy</p>
                </div>
              )}

              {/* Info */}
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 px-2">
                Chúng tôi đã gửi thông tin đơn hàng đến email của bạn (nếu bạn đã đăng nhập).
                <br className="hidden sm:block" />
                <span className="block sm:inline"> Bạn có thể sử dụng mã đơn hàng hoặc link trên để theo dõi trạng thái đơn hàng.</span>
              </p>

              {/* Close Button */}
              <button
                onClick={handleCloseSuccess}
                className="w-full py-2.5 sm:py-3 bg-muted hover:bg-muted/80 text-card-foreground font-semibold rounded-lg transition-colors cursor-pointer text-sm sm:text-base"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal - Hiển thị phía trên success screen */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
            <div
              ref={modalRef}
              className="relative w-full max-w-md bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-fade-in-up"
            >
              {/* Close Button */}
              <button
                onClick={handleCancelCancel}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors z-10 cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Modal Content */}
              <div className="p-4 sm:p-6 text-center">
                {/* Warning Icon */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-destructive/20 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-destructive" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-2">
                  Xác nhận hủy đơn hàng
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Bạn có chắc chắn muốn hủy đơn hàng <span className="font-semibold text-card-foreground">{successOrder?.order_id}</span>?
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  Hành động này không thể hoàn tác.
                </p>

                {/* Cancel Reason Input */}
                <div className="mb-4 sm:mb-6 text-left">
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Lý do hủy đơn hàng <span className="text-muted-foreground text-xs">(Tùy chọn)</span>
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Nhập lý do hủy đơn hàng (nếu có)..."
                    rows={3}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {cancelReason.length}/500 ký tự
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                  <button
                    onClick={handleCancelCancel}
                    className="flex-1 py-2.5 sm:py-3 bg-muted hover:bg-muted/80 text-card-foreground font-semibold rounded-lg transition-colors cursor-pointer text-sm sm:text-base"
                  >
                    Không, giữ lại
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    disabled={cancelling}
                    className="flex-1 py-2.5 sm:py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span>Đang hủy...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Có, hủy đơn hàng</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
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
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors z-10 cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-border bg-primary/10 py-4 px-6">
          <h2 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Đặt hàng
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
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
                <span className="text-card-foreground font-medium">{totalQuantity} sản phẩm</span>
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
                  value={formData.customer_name || ""}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className={`w-full pl-10 pr-4 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.customer_name ? "border-destructive" : "border-border"
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
                  value={formData.customer_phone || ""}
                  onChange={handleChange}
                  placeholder="0901234567"
                  className={`w-full pl-10 pr-4 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.customer_phone ? "border-destructive" : "border-border"
                    }`}
                />
              </div>
              {errors.customer_phone && (
                <p className="mt-1 text-sm text-destructive">{errors.customer_phone}</p>
              )}
            </div>

            {/* Customer Email with Verification */}
            <div>
              <label htmlFor="customer_email" className="block text-sm font-medium text-card-foreground mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email <span className="text-destructive">*</span>
                {emailVerification.verified && (
                  <ShieldCheck className="inline w-4 h-4 ml-2 text-green-500" />
                )}
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="customer_email"
                      name="customer_email"
                      type="email"
                      value={formData.customer_email || ""}
                      onChange={(e) => {
                        handleChange(e)
                        // Reset verification when email changes
                        if (emailVerification.verified) {
                          const user = getUser()
                          const isLoggedIn = user && user.user_id
                          const newEmail = e.target.value.trim().toLowerCase()

                          // Nếu user đã login và email mới khớp với email của user, tự động verify lại
                          if (isLoggedIn && user.email && newEmail === user.email.toLowerCase()) {
                            // Tự động verify lại cho user đã login
                            if (typeof window !== "undefined") {
                              const verifiedEmails = JSON.parse(localStorage.getItem('verified_emails') || '{}')
                              const emailKey = newEmail
                              const expiresAt = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 ngày

                              verifiedEmails[emailKey] = {
                                verified: true,
                                verifiedAt: new Date().toISOString(),
                                expiresAt: expiresAt.toISOString(),
                                autoVerified: true,
                              }
                              localStorage.setItem('verified_emails', JSON.stringify(verifiedEmails))

                              setEmailVerification({
                                step: 'verified',
                                code: "",
                                sendingCode: false,
                                verifyingCode: false,
                                error: "",
                                verified: true,
                              })
                            }
                          } else {
                            // Reset verification nếu không phải email của user đã login
                            setEmailVerification({
                              step: 'input',
                              code: "",
                              sendingCode: false,
                              verifyingCode: false,
                              error: "",
                              verified: false,
                            })
                            // Xóa verified email khỏi localStorage khi đổi email
                            if (typeof window !== "undefined") {
                              const verifiedEmails = JSON.parse(localStorage.getItem('verified_emails') || '{}')
                              const oldEmail = formData.customer_email.trim().toLowerCase()
                              if (oldEmail) {
                                delete verifiedEmails[oldEmail]
                                localStorage.setItem('verified_emails', JSON.stringify(verifiedEmails))
                              }
                            }
                          }
                        }
                      }}
                      placeholder="example@email.com"
                      className={`w-full pl-10 pr-4 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.customer_email ? "border-destructive" : emailVerification.verified ? "border-green-500" : "border-border"
                        } ${emailVerification.verified ? "bg-green-500/10" : ""}`}
                    />
                  </div>
                  {emailVerification.verified ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEmailVerification({
                          step: 'input',
                          code: "",
                          sendingCode: false,
                          verifyingCode: false,
                          error: "",
                          verified: false,
                        })
                        // Xóa verified email khỏi localStorage
                        if (typeof window !== "undefined" && formData.customer_email) {
                          const verifiedEmails = JSON.parse(localStorage.getItem('verified_emails') || '{}')
                          delete verifiedEmails[formData.customer_email.trim().toLowerCase()]
                          localStorage.setItem('verified_emails', JSON.stringify(verifiedEmails))
                        }
                      }}
                      className="px-4 py-3 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 border border-border"
                    >
                      <X className="w-4 h-4" />
                      Đổi email
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={emailVerification.sendingCode || !formData.customer_email || !formData.customer_email.trim() || !validateEmail(formData.customer_email)}
                      className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2 cursor-pointer"
                    >
                      {emailVerification.sendingCode ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        "Gửi mã"
                      )}
                    </button>
                  )}
                </div>
                {errors.customer_email && (
                  <p className="text-sm text-destructive">{errors.customer_email}</p>
                )}
                {emailVerification.error && (
                  <p className="text-sm text-destructive">{emailVerification.error}</p>
                )}

                {/* Verification Code Input */}
                {emailVerification.step === 'verify_code' && !emailVerification.verified && (
                  <div className="space-y-2 p-3 bg-muted rounded-lg border border-border">
                    <label className="block text-sm font-medium text-card-foreground">
                      Nhập mã xác thực (6 chữ số)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={emailVerification.code}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          setEmailVerification(prev => ({ ...prev, code: value, error: "" }))
                        }}
                        className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg tracking-widest font-mono"
                        placeholder="000000"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailCode}
                        disabled={emailVerification.verifyingCode || emailVerification.code.length !== 6}
                        className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {emailVerification.verifyingCode ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Xác thực"
                        )}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailVerification(prev => ({ ...prev, step: 'input', code: "", error: "" }))}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Gửi lại mã
                    </button>
                    {/* Trạng thía đơn hàng sẽ được gửi qua email này */}
                    <p className="text-xs text-muted-foreground">Trạng thái đơn hàng sẽ được gửi qua email này</p>
                  </div>
                )}

                {/* Verified Status */}
                {emailVerification.verified && (
                  <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">Email đã được xác thực</span>
                  </div>
                )}
              </div>
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
                  value={formData.customer_address || ""}
                  onChange={handleChange}
                  placeholder="123 Đường ABC, Quận XYZ"
                  className={`w-full pl-10 pr-4 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.customer_address ? "border-destructive" : "border-border"
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
                  value={formData.notes || ""}
                  onChange={handleChange}
                  placeholder="Ghi chú thêm cho đơn hàng..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>

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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Đặt hàng ngay</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

