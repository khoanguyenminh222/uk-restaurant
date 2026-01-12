"use client"

import { useState, useEffect, useRef } from "react"
import { X, User, Phone, MapPin, Mail, Edit2, Save, X as XIcon, Loader2 } from "lucide-react"
import { getUser, saveUser } from "@/utils/user"
import { userFetch } from "@/lib/userAuth"

export default function UserProfile({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const modalRef = useRef(null)

  // User info state
  const [user, setUser] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    email: "",
  })

  // Load user info
  useEffect(() => {
    if (isOpen) {
      const currentUser = getUser()
      if (currentUser) {
        setUser(currentUser)
        setEditForm({
          name: currentUser.name || "",
          address: currentUser.address || "",
          email: currentUser.email || "",
        })
      } else {
        // User not logged in, close modal
        onClose()
      }
    }
  }, [isOpen, onClose])

  // Handle click outside to close modals and scroll lock
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if an operation is active
      if (loading) return;

      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose, loading])

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle save profile
  const handleSaveProfile = async () => {
    setError("")
    setSuccess("")

    // Validate required fields
    if (!editForm.name.trim()) {
      setError("Tên là bắt buộc")
      return
    }

    if (!editForm.email.trim()) {
      setError("Email là bắt buộc")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editForm.email.trim())) {
      setError("Email không hợp lệ")
      return
    }

    // Check phone number (read-only but required)
    if (!user.phone || !user.phone.trim()) {
      setError("Số điện thoại là bắt buộc. Vui lòng liên hệ hỗ trợ.")
      return
    }

    // Kiểm tra email có thay đổi không
    const currentEmail = (user.email || "").trim().toLowerCase()
    const newEmail = editForm.email.trim().toLowerCase()
    const emailChanged = currentEmail !== newEmail

    // Nếu email thay đổi, kiểm tra email đã tồn tại chưa
    if (emailChanged) {
      // API sẽ tự động kiểm tra, nhưng có thể check trước để UX tốt hơn
      // Tuy nhiên, để đảm bảo chính xác, ta sẽ để API kiểm tra
    }

    setLoading(true)
    try {
      // Gọi API để cập nhật thông tin user
      if (!user.user_id) {
        setError("Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.")
        return
      }

      const updateData = {
        name: editForm.name.trim(),
        address: editForm.address.trim(),
        email: editForm.email.trim(),
      }

      const response = await userFetch(`/api/users/${user.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Xử lý lỗi từ API
        if (data.error) {
          if (data.error.includes('Email đã được sử dụng') || data.error.includes('email')) {
            setError("Email này đã được sử dụng bởi tài khoản khác. Vui lòng chọn email khác.")
          } else {
            setError(data.error || "Lỗi khi cập nhật thông tin")
          }
        } else {
          setError("Lỗi khi cập nhật thông tin")
        }
        return
      }

      // Cập nhật thành công - lưu vào localStorage
      const updatedUser = {
        ...user,
        ...data.data, // Dữ liệu từ API (đã được normalize)
        name: editForm.name.trim(),
        address: editForm.address.trim(),
        email: editForm.email.trim().toLowerCase(),
      }

      saveUser(updatedUser)
      setUser(updatedUser)
      setIsEditing(false)
      setSuccess("Đã cập nhật thông tin thành công")

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Lỗi kết nối khi cập nhật thông tin. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }


  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors z-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-border bg-primary/10 py-4 px-6">
          <h2 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            Thông tin tài khoản
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Messages */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-success/10 border border-success/50 rounded-lg text-success text-sm">
              {success}
            </div>
          )}

          {/* Profile Section */}
          <div className="bg-muted/50 rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">Thông tin cá nhân</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  Sửa thông tin
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditForm({
                        name: user.name || "",
                        address: user.address || "",
                        email: user.email || "",
                      })
                      setError("")
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    <XIcon className="w-4 h-4" />
                    Hủy
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Tên <span className="text-destructive">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                ) : (
                  <p className="text-card-foreground">{user.name || "N/A"}</p>
                )}
              </div>

              {/* Phone (read-only) */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Số điện thoại <span className="text-destructive">*</span>
                </label>
                <p className="text-card-foreground">{user.phone || "Chưa có"}</p>
                <p className="text-xs text-muted-foreground mt-1">Số điện thoại không thể thay đổi</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email <span className="text-destructive">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                ) : (
                  <p className="text-card-foreground">{user.email || "N/A"}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Địa chỉ
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                ) : (
                  <p className="text-card-foreground">{user.address || "Chưa cập nhật"}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

