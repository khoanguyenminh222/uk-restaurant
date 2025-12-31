"use client"

import { useState, useEffect, useRef } from "react"
import { X, Eye, EyeOff, Mail, Phone, User, MapPin, Lock } from "lucide-react"
import { saveUser } from "@/utils/user"

export default function Auth({ isOpen, onClose, initialTab = "login" }) {
  const [activeTab, setActiveTab] = useState(initialTab) // "login" or "register"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const modalRef = useRef(null)

  // Login form state
  const [loginForm, setLoginForm] = useState({
    phone: "",
    password: "",
  })

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    phone: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  })

  // Validation errors
  const [loginErrors, setLoginErrors] = useState({})
  const [registerErrors, setRegisterErrors] = useState({})

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

  // Reset form when switching tabs
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      setError("")
      setLoginErrors({})
      setRegisterErrors({})
    }
  }, [isOpen, initialTab])

  // Validate phone format (Vietnamese)
  const validatePhone = (phone) => {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
    return phoneRegex.test(phone.replace(/\s+/g, ""))
  }

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate password strength
  const validatePassword = (password) => {
    return password.length >= 6
  }

  // Handle login form change
  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
    if (loginErrors[name]) {
      setLoginErrors((prev) => ({ ...prev, [name]: "" }))
    }
    setError("")
  }

  // Handle register form change
  const handleRegisterChange = (e) => {
    const { name, value } = e.target
    setRegisterForm((prev) => ({ ...prev, [name]: value }))
    if (registerErrors[name]) {
      setRegisterErrors((prev) => ({ ...prev, [name]: "" }))
    }
    setError("")
  }

  // Validate login form
  const validateLogin = () => {
    const errors = {}
    if (!loginForm.phone.trim()) {
      errors.phone = "Số điện thoại là bắt buộc"
    } else if (!validatePhone(loginForm.phone)) {
      errors.phone = "Số điện thoại không hợp lệ"
    }
    if (!loginForm.password) {
      errors.password = "Mật khẩu là bắt buộc"
    }
    setLoginErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validate register form
  const validateRegister = () => {
    const errors = {}
    if (!registerForm.phone.trim()) {
      errors.phone = "Số điện thoại là bắt buộc"
    } else if (!validatePhone(registerForm.phone)) {
      errors.phone = "Số điện thoại không hợp lệ (ví dụ: 0901234567)"
    }
    if (!registerForm.name.trim()) {
      errors.name = "Tên là bắt buộc"
    }
    if (!registerForm.email.trim()) {
      errors.email = "Email là bắt buộc"
    } else if (!validateEmail(registerForm.email)) {
      errors.email = "Email không hợp lệ"
    }
    if (!registerForm.password) {
      errors.password = "Mật khẩu là bắt buộc"
    } else if (!validatePassword(registerForm.password)) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }
    if (!registerForm.confirmPassword) {
      errors.confirmPassword = "Xác nhận mật khẩu là bắt buộc"
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = "Mật khẩu không khớp"
    }
    setRegisterErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle login submit
  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!validateLogin()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: loginForm.phone.replace(/\s+/g, ""),
          password: loginForm.password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Save user to localStorage
        const userData = {
          user_id: data.data.user_id,
          phone: data.data.phone,
          name: data.data.name,
          email: data.data.email,
          address: data.data.address || "",
        }
        saveUser(userData)

        // Close modal
        onClose()

        // Reload page to update header
        window.location.reload()
      } else {
        setError(data.error || "Đăng nhập thất bại")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Lỗi kết nối. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  // Handle register submit
  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")

    if (!validateRegister()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: registerForm.phone.replace(/\s+/g, ""),
          name: registerForm.name.trim(),
          email: registerForm.email.trim().toLowerCase(),
          password: registerForm.password,
          address: registerForm.address.trim() || "",
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Auto login after registration
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: registerForm.phone.replace(/\s+/g, ""),
            password: registerForm.password,
          }),
        })

        const loginData = await loginResponse.json()

        if (loginData.success) {
          // Save user to localStorage
          const userData = {
            user_id: loginData.data.user_id,
            phone: loginData.data.phone,
            name: loginData.data.name,
            email: loginData.data.email,
            address: loginData.data.address || "",
          }
          saveUser(userData)

          // Close modal
          onClose()

          // Reload page to update header
          window.location.reload()
        } else {
          setError("Đăng ký thành công nhưng đăng nhập thất bại. Vui lòng đăng nhập lại.")
        }
      } else {
        setError(data.error || "Đăng ký thất bại")
      }
    } catch (err) {
      console.error("Register error:", err)
      setError("Lỗi kết nối. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden animate-fade-in-up"
      >
        {/* Close Button */}
        {/* <button
          onClick={onClose}
          className="absolute top-2 right-4 p-2 text-red-400 hover:text-red-500 hover:bg-gray-800 rounded-lg transition-colors z-10"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button> */}

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => {
              setActiveTab("login")
              setError("")
              setLoginErrors({})
            }}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === "login"
                ? "bg-green-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => {
              setActiveTab("register")
              setError("")
              setRegisterErrors({})
            }}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === "register"
                ? "bg-green-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Phone */}
              <div>
                <label htmlFor="login-phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Số điện thoại <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="login-phone"
                    name="phone"
                    type="tel"
                    value={loginForm.phone}
                    onChange={handleLoginChange}
                    placeholder="0901234567"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      loginErrors.phone ? "border-red-500" : "border-gray-700"
                    }`}
                  />
                </div>
                {loginErrors.phone && (
                  <p className="mt-1 text-sm text-red-400">{loginErrors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mật khẩu <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    placeholder="Nhập mật khẩu"
                    className={`w-full pl-10 pr-12 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      loginErrors.password ? "border-red-500" : "border-gray-700"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="mt-1 text-sm text-red-400">{loginErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-green-600 focus:ring-green-500"
                  />
                  <span>Nhớ mật khẩu</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-green-400 hover:text-green-300 transition-colors"
                  onClick={() => {
                    // TODO: Implement forgot password
                    setError("Tính năng quên mật khẩu đang được phát triển")
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              {/* Switch to Register */}
              <p className="text-center text-sm text-gray-400">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="text-green-400 hover:text-green-300 font-medium transition-colors"
                >
                  Đăng ký ngay
                </button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Phone */}
              <div>
                <label htmlFor="register-phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Số điện thoại <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    value={registerForm.phone}
                    onChange={handleRegisterChange}
                    placeholder="0901234567"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      registerErrors.phone ? "border-red-500" : "border-gray-700"
                    }`}
                  />
                </div>
                {registerErrors.phone && (
                  <p className="mt-1 text-sm text-red-400">{registerErrors.phone}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="register-name" className="block text-sm font-medium text-gray-300 mb-2">
                  Tên <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    placeholder="Nguyễn Văn A"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      registerErrors.name ? "border-red-500" : "border-gray-700"
                    }`}
                  />
                </div>
                {registerErrors.name && (
                  <p className="mt-1 text-sm text-red-400">{registerErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    placeholder="example@email.com"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      registerErrors.email ? "border-red-500" : "border-gray-700"
                    }`}
                  />
                </div>
                {registerErrors.email && (
                  <p className="mt-1 text-sm text-red-400">{registerErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mật khẩu <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    placeholder="Ít nhất 6 ký tự"
                    className={`w-full pl-10 pr-12 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      registerErrors.password ? "border-red-500" : "border-gray-700"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {registerErrors.password && (
                  <p className="mt-1 text-sm text-red-400">{registerErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
                  Xác nhận mật khẩu <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="Nhập lại mật khẩu"
                    className={`w-full pl-10 pr-12 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      registerErrors.confirmPassword ? "border-red-500" : "border-gray-700"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {registerErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{registerErrors.confirmPassword}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="register-address" className="block text-sm font-medium text-gray-300 mb-2">
                  Địa chỉ <span className="text-gray-500 text-xs">(Tùy chọn)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="register-address"
                    name="address"
                    type="text"
                    value={registerForm.address}
                    onChange={handleRegisterChange}
                    placeholder="123 Đường ABC, Quận XYZ"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Info Text */}
              <p className="text-xs text-gray-500 text-center">
                Chúng tôi sẽ gửi email xác thực để bảo vệ tài khoản và giúp bạn khôi phục mật khẩu nếu cần
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </button>

              {/* Switch to Login */}
              <p className="text-center text-sm text-gray-400">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-green-400 hover:text-green-300 font-medium transition-colors"
                >
                  Đăng nhập
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

