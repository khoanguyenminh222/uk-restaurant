"use client"

import { useState, useEffect, useRef } from "react"
import { X, Eye, EyeOff, Mail, Phone, User, MapPin, Lock } from "lucide-react"
import { saveUser } from "@/utils/user"

export default function Auth({ isOpen, onClose, initialTab = "login" }) {
  const [activeTab, setActiveTab] = useState(initialTab) // "login" or "register" or "verify" or "forgot-password"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [resendCooldown, setResendCooldown] = useState(0)
  const [registeredUser, setRegisteredUser] = useState(null) // Lưu thông tin user sau khi đăng ký
  const [showChangeEmail, setShowChangeEmail] = useState(false) // Hiển thị form đổi email
  const [newEmail, setNewEmail] = useState("") // Email mới
  const [emailError, setEmailError] = useState("") // Lỗi email
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

  // Forgot password form state
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    phone: "",
  })
  const [forgotPasswordErrors, setForgotPasswordErrors] = useState({})

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
      setSuccessMessage("")
      setLoginErrors({})
      setRegisterErrors({})
      setForgotPasswordErrors({})
      setVerificationCode(["", "", "", "", "", ""])
      setRegisteredUser(null)
      setShowChangeEmail(false)
      setNewEmail("")
      setEmailError("")
      setForgotPasswordForm({ phone: "" })
    }
  }, [isOpen, initialTab])

  // Cooldown timer for resend email
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

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
          email_verified: data.email_verified || false,
          role: data.data.role || 'user', // Include role
        }
        saveUser(userData)

        // If user is admin or super_admin, also save to admin_data
        if (data.data.role === 'admin' || data.data.role === 'super_admin') {
          localStorage.setItem('admin_data', JSON.stringify(data.data))
          localStorage.setItem('admin_logged_in', 'true')
        }

        // Save success message to show after reload
        localStorage.setItem('login_success_message', 'Đăng nhập thành công!')

        // Close modal
        onClose()

        // Reload page to update header
        window.location.reload()
      } else {
        // If email not verified, switch to verification tab
        if (data.email_not_verified && data.email) {
          setRegisteredUser({
            phone: loginForm.phone.replace(/\s+/g, ""),
            email: data.email,
            name: data.user?.name || "", // Get name from user data if available
            password: loginForm.password, // Save password for auto login after verification
          })
          setActiveTab("verify")
          setResendCooldown(60) // Cooldown 60 giây
          setError("")
          
          // Auto resend verification email
          try {
            const resendResponse = await fetch("/api/auth/resend-verification", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                phone: loginForm.phone.replace(/\s+/g, ""),
              }),
            })
            const resendData = await resendResponse.json()
            if (resendData.success) {
              setError("") // Clear error, show success message
              // Success message will be shown in verification screen
            } else {
              setError(resendData.error || "Không thể gửi lại email. Vui lòng thử lại sau.")
            }
          } catch (resendErr) {
            console.error("Resend verification error:", resendErr)
            setError("Không thể gửi lại email. Vui lòng thử lại sau.")
          }
        } else {
          setError(data.error || "Đăng nhập thất bại")
        }
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
        // Lưu thông tin user để dùng cho verification
        setRegisteredUser({
          phone: registerForm.phone.replace(/\s+/g, ""),
          email: registerForm.email.trim().toLowerCase(),
          name: registerForm.name.trim(),
          password: registerForm.password, // Lưu tạm để auto login sau khi verify
        })
        
        // Chuyển sang màn hình verification
        setActiveTab("verify")
        setError("")
        setResendCooldown(60) // Cooldown 60 giây
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

  // Handle verification code change
  const handleVerificationCodeChange = (index, value) => {
    // Only allow numeric input
    if (value && !/^\d$/.test(value)) {
      return
    }

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Auto-focus next input if digit entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`verification-code-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  // Handle paste verification code
  const handleVerificationCodePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()
    
    // Only accept 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("")
      setVerificationCode(digits)
      
      // Focus last input
      const lastInput = document.getElementById(`verification-code-5`)
      if (lastInput) lastInput.focus()
    }
  }

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!registeredUser || !registeredUser.phone) {
      setError("Không tìm thấy thông tin người dùng")
      return
    }

    setLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: registeredUser.phone,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResendCooldown(60) // Reset cooldown to 60 seconds
        setError("") // Clear any errors
        // Optionally show success message
        alert("Đã gửi lại mã xác thực đến email của bạn")
      } else {
        setError(data.error || "Không thể gửi lại email. Vui lòng thử lại sau.")
      }
    } catch (err) {
      console.error("Resend verification error:", err)
      setError("Lỗi kết nối. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  // Handle change email
  const handleChangeEmail = async (e) => {
    e.preventDefault()
    setEmailError("")
    setError("")

    if (!registeredUser || !registeredUser.phone) {
      setEmailError("Không tìm thấy thông tin người dùng")
      return
    }

    if (!newEmail.trim()) {
      setEmailError("Email là bắt buộc")
      return
    }

    if (!validateEmail(newEmail.trim())) {
      setEmailError("Email không hợp lệ")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: registeredUser.phone,
          newEmail: newEmail.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update registeredUser with new email
        setRegisteredUser({
          ...registeredUser,
          email: data.email,
        })
        setNewEmail("")
        setShowChangeEmail(false)
        setResendCooldown(60) // Reset cooldown
        setError("") // Clear errors
        setEmailError("") // Clear email errors
        // Show success message
        alert("Đã đổi email và gửi mã xác thực đến email mới")
      } else {
        setEmailError(data.error || "Không thể đổi email. Vui lòng thử lại sau.")
      }
    } catch (err) {
      console.error("Change email error:", err)
      setEmailError("Lỗi kết nối. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  // Handle forgot password form change
  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target
    setForgotPasswordForm((prev) => ({ ...prev, [name]: value }))
    if (forgotPasswordErrors[name]) {
      setForgotPasswordErrors((prev) => ({ ...prev, [name]: "" }))
    }
    setError("")
    setSuccessMessage("")
  }

  // Validate forgot password form
  const validateForgotPassword = () => {
    const errors = {}
    if (!forgotPasswordForm.phone.trim()) {
      errors.phone = "Số điện thoại là bắt buộc"
    } else if (!validatePhone(forgotPasswordForm.phone)) {
      errors.phone = "Số điện thoại không hợp lệ"
    }
    setForgotPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle forgot password submit
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!validateForgotPassword()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: forgotPasswordForm.phone.replace(/\s+/g, ""),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccessMessage(data.message || "Đã gửi email hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.")
        setError("")
        // Reset form
        setForgotPasswordForm({ phone: "" })
      } else {
        setError(data.error || "Không thể gửi email. Vui lòng thử lại sau.")
        setSuccessMessage("")
      }
    } catch (err) {
      console.error("Forgot password error:", err)
      setError("Lỗi kết nối. Vui lòng thử lại sau.")
      setSuccessMessage("")
    } finally {
      setLoading(false)
    }
  }

  // Handle verify email
  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    setError("")

    if (!registeredUser || !registeredUser.phone) {
      setError("Không tìm thấy thông tin người dùng")
      return
    }

    const code = verificationCode.join("")
    if (code.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 số")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: registeredUser.phone,
          code: code,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Auto login after successful verification
        try {
          const loginResponse = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone: registeredUser.phone,
              password: registeredUser.password,
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
              email_verified: true,
              role: loginData.data.role || 'user', // Include role
            }
            saveUser(userData)

            // If user is admin or super_admin, also save to admin_data
            if (loginData.data.role === 'admin' || loginData.data.role === 'super_admin') {
              localStorage.setItem('admin_data', JSON.stringify(loginData.data))
              localStorage.setItem('admin_logged_in', 'true')
            }

            // Close modal
            onClose()

            // Reload page to update header
            window.location.reload()
          } else {
            setError(loginData.error || "Xác thực thành công nhưng đăng nhập thất bại. Vui lòng đăng nhập lại.")
          }
        } catch (loginErr) {
          console.error("Auto login error:", loginErr)
          setError("Xác thực thành công nhưng đăng nhập thất bại. Vui lòng đăng nhập lại.")
        }
      } else {
        setError(data.error || "Mã xác thực không đúng")
      }
    } catch (err) {
      console.error("Verify email error:", err)
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
        className="relative w-full max-w-md bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-fade-in-up"
      >
        {/* Tabs - Chỉ hiển thị khi không ở verification screen và forgot-password */}
        {activeTab !== "verify" && activeTab !== "forgot-password" && (
          <div className="flex border-b border-border">
            <button
              onClick={() => {
                setActiveTab("login")
                setError("")
                setLoginErrors({})
              }}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "login"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-card-foreground hover:bg-muted"
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
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-card-foreground hover:bg-muted"
              }`}
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* Verification Header */}
        {activeTab === "verify" && (
          <div className="border-b border-border bg-primary/10 py-4 px-6">
            <h3 className="text-lg font-semibold text-card-foreground text-center">Xác thực email</h3>
          </div>
        )}

        {/* Forgot Password Header */}
        {activeTab === "forgot-password" && (
          <div className="border-b border-border bg-primary/10 py-4 px-6">
            <h3 className="text-lg font-semibold text-card-foreground text-center">Quên mật khẩu</h3>
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-success/10 border border-success/50 rounded-lg text-success text-sm">
              {successMessage}
            </div>
          )}

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Phone */}
              <div>
                <label htmlFor="login-phone" className="block text-sm font-medium text-card-foreground mb-2">
                  Số điện thoại <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="login-phone"
                    name="phone"
                    type="tel"
                    value={loginForm.phone}
                    onChange={handleLoginChange}
                    placeholder="0901234567"
                    className={`w-full pl-10 pr-4 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                      loginErrors.phone ? "border-destructive" : "border-border"
                    }`}
                  />
                </div>
                {loginErrors.phone && (
                  <p className="mt-1 text-sm text-destructive">{loginErrors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-card-foreground mb-2">
                  Mật khẩu <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    placeholder="Nhập mật khẩu"
                    className={`w-full pl-10 pr-12 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                      loginErrors.password ? "border-destructive" : "border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="mt-1 text-sm text-destructive">{loginErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-ring"
                  />
                  <span>Nhớ mật khẩu</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary-dark transition-colors"
                  onClick={() => {
                    setActiveTab("forgot-password")
                    setError("")
                    setSuccessMessage("")
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              {/* Switch to Register */}
              <p className="text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="text-primary hover:text-primary-dark font-medium transition-colors"
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
                <label htmlFor="register-phone" className="block text-sm font-medium text-card-foreground mb-2">
                  Số điện thoại <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    value={registerForm.phone}
                    onChange={handleRegisterChange}
                    placeholder="0901234567"
                    className={`w-full pl-10 pr-4 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                      registerErrors.phone ? "border-destructive" : "border-border"
                    }`}
                  />
                </div>
                {registerErrors.phone && (
                  <p className="mt-1 text-sm text-destructive">{registerErrors.phone}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="register-name" className="block text-sm font-medium text-card-foreground mb-2">
                  Tên <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    placeholder="Nguyễn Văn A"
                    className={`w-full pl-10 pr-4 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                      registerErrors.name ? "border-destructive" : "border-border"
                    }`}
                  />
                </div>
                {registerErrors.name && (
                  <p className="mt-1 text-sm text-destructive">{registerErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-card-foreground mb-2">
                  Email <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    placeholder="example@email.com"
                    className={`w-full pl-10 pr-4 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                      registerErrors.email ? "border-destructive" : "border-border"
                    }`}
                  />
                </div>
                {registerErrors.email && (
                  <p className="mt-1 text-sm text-destructive">{registerErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-card-foreground mb-2">
                  Mật khẩu <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    placeholder="Ít nhất 6 ký tự"
                    className={`w-full pl-10 pr-12 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                      registerErrors.password ? "border-destructive" : "border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {registerErrors.password && (
                  <p className="mt-1 text-sm text-destructive">{registerErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="register-confirm-password" className="block text-sm font-medium text-card-foreground mb-2">
                  Xác nhận mật khẩu <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="Nhập lại mật khẩu"
                    className={`w-full pl-10 pr-12 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                      registerErrors.confirmPassword ? "border-destructive" : "border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {registerErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-destructive">{registerErrors.confirmPassword}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="register-address" className="block text-sm font-medium text-card-foreground mb-2">
                  Địa chỉ <span className="text-muted-foreground text-xs">(Tùy chọn)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="register-address"
                    name="address"
                    type="text"
                    value={registerForm.address}
                    onChange={handleRegisterChange}
                    placeholder="123 Đường ABC, Quận XYZ"
                    className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Info Text */}
              <p className="text-xs text-muted-foreground text-center">
                Chúng tôi sẽ gửi email xác thực để bảo vệ tài khoản và giúp bạn khôi phục mật khẩu nếu cần
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </button>

              {/* Switch to Login */}
              <p className="text-center text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  Đăng nhập
                </button>
              </p>
            </form>
          )}

          {/* Forgot Password Form */}
          {activeTab === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center mb-6">
                <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Quên mật khẩu?</h3>
                <p className="text-muted-foreground text-sm">
                  Nhập số điện thoại của bạn, chúng tôi sẽ gửi email hướng dẫn đặt lại mật khẩu.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="forgot-phone" className="block text-sm font-medium text-card-foreground mb-2">
                  Số điện thoại <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="forgot-phone"
                    name="phone"
                    type="tel"
                    value={forgotPasswordForm.phone}
                    onChange={handleForgotPasswordChange}
                    placeholder="0901234567"
                    className={`w-full pl-10 pr-4 py-3 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                      forgotPasswordErrors.phone ? "border-destructive" : "border-border"
                    }`}
                  />
                </div>
                {forgotPasswordErrors.phone && (
                  <p className="mt-1 text-sm text-destructive">{forgotPasswordErrors.phone}</p>
                )}
              </div>

              {/* Info Text */}
              <p className="text-xs text-muted-foreground text-center">
                Chúng tôi sẽ gửi link đặt lại mật khẩu đến email đã đăng ký của bạn. Link sẽ hết hạn sau 30 phút.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
              </button>

              {/* Back to Login */}
              <p className="text-center text-sm text-muted-foreground">
                Nhớ mật khẩu?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login")
                    setError("")
                    setSuccessMessage("")
                    setForgotPasswordForm({ phone: "" })
                    setForgotPasswordErrors({})
                  }}
                  className="text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  Đăng nhập
                </button>
              </p>
            </form>
          )}

          {/* Verification Form */}
          {activeTab === "verify" && registeredUser && (
            <form onSubmit={handleVerifyEmail} className="space-y-6">
              <div className="text-center">
                <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Kiểm tra email của bạn</h3>
                <p className="text-muted-foreground text-sm mb-1">
                  Chúng tôi đã gửi mã xác thực đến:
                </p>
                <p className="text-primary font-medium">{registeredUser.email}</p>
                <p className="text-muted-foreground text-xs mt-2">
                  Vui lòng nhập mã 6 số để hoàn tất đăng ký
                </p>
                
                {/* Change Email Button */}
                {!showChangeEmail && (
                  <button
                    type="button"
                    onClick={() => setShowChangeEmail(true)}
                    className="mt-3 text-sm text-info hover:text-info/80 font-medium transition-colors"
                  >
                    Đổi email khác
                  </button>
                )}
              </div>

              {/* Change Email Form */}
              {showChangeEmail && (
                <div className="border border-border rounded-lg p-4 bg-muted/50 space-y-3">
                  <h4 className="text-sm font-medium text-card-foreground mb-2">Đổi email</h4>
                  <div>
                    <label htmlFor="new-email" className="block text-xs font-medium text-muted-foreground mb-1">
                      Email mới
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        id="new-email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => {
                          setNewEmail(e.target.value)
                          setEmailError("")
                        }}
                        placeholder="email@example.com"
                        className={`w-full pl-10 pr-4 py-2 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                          emailError ? "border-destructive" : "border-border"
                        }`}
                      />
                    </div>
                    {emailError && (
                      <p className="mt-1 text-xs text-destructive">{emailError}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleChangeEmail}
                      disabled={loading}
                      className="flex-1 py-2 bg-info hover:bg-info/80 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowChangeEmail(false)
                        setNewEmail("")
                        setEmailError("")
                      }}
                      disabled={loading}
                      className="flex-1 py-2 bg-muted hover:bg-muted/80 text-card-foreground text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {/* Verification Code Inputs */}
              <div className="flex justify-center gap-2">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`verification-code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                    onPaste={index === 0 ? handleVerificationCodePaste : undefined}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && index > 0) {
                        const prevInput = document.getElementById(`verification-code-${index - 1}`)
                        if (prevInput) prevInput.focus()
                      }
                    }}
                    className="w-12 h-14 text-center text-2xl font-bold bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                ))}
              </div>

              {/* Resend Email Button */}
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-2">Không nhận được email?</p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0 || loading}
                  className="text-primary hover:text-primary-dark text-sm font-medium transition-colors disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `Gửi lại sau ${resendCooldown}s`
                    : "Gửi lại email"}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || verificationCode.join("").length !== 6}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xác thực..." : "Xác thực"}
              </button>

              {/* Back to Register */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register")
                  setRegisteredUser(null)
                  setVerificationCode(["", "", "", "", "", ""])
                  setError("")
                }}
                className="w-full py-2 text-muted-foreground hover:text-card-foreground text-sm transition-colors"
              >
                ← Thay đổi thông tin
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

