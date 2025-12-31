"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState({})

  useEffect(() => {
    if (!token) {
      setError("Token không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu lại.")
    }
  }, [token])

  const validatePassword = (pwd) => {
    return pwd.length >= 6
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    if (name === "password") {
      setPassword(value)
    } else {
      setConfirmPassword(value)
    }
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }))
    }
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setPasswordErrors({})

    // Validate
    const errors = {}
    if (!password) {
      errors.password = "Mật khẩu là bắt buộc"
    } else if (!validatePassword(password)) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Xác nhận mật khẩu là bắt buộc"
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu không khớp"
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    if (!token) {
      setError("Token không hợp lệ")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setError("")
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/")
        }, 3000)
      } else {
        setError(data.error || "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.")
      }
    } catch (err) {
      console.error("Reset password error:", err)
      setError("Lỗi kết nối. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-50 mb-2">Đặt lại mật khẩu thành công!</h1>
          <p className="text-gray-400 mb-6">
            Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển đến trang chủ để đăng nhập.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
        <div className="border-b border-gray-800 bg-green-950/20 py-4 px-6">
          <h1 className="text-xl font-semibold text-gray-50 text-center">Đặt lại mật khẩu</h1>
        </div>

        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {!token ? (
            <div className="text-center">
              <p className="text-gray-400 mb-4">
                Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mật khẩu mới <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Ít nhất 6 ký tự"
                    className={`w-full pl-10 pr-12 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      passwordErrors.password ? "border-red-500" : "border-gray-700"
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
                {passwordErrors.password && (
                  <p className="mt-1 text-sm text-red-400">{passwordErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Xác nhận mật khẩu <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập lại mật khẩu"
                    className={`w-full pl-10 pr-12 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      passwordErrors.confirmPassword ? "border-red-500" : "border-gray-700"
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
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </button>

              <p className="text-center text-sm text-gray-400">
                <Link href="/" className="text-green-400 hover:text-green-300 font-medium transition-colors">
                  Về trang chủ
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

