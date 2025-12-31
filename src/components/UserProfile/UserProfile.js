"use client"

import { useState, useEffect, useRef } from "react"
import { X, User, Phone, MapPin, Mail, Edit2, Save, X as XIcon, Loader2 } from "lucide-react"
import { getUser, saveUser } from "@/utils/user"

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

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle save profile
  const handleSaveProfile = async () => {
    setError("")
    setSuccess("")

    if (!editForm.name.trim()) {
      setError("Tên là bắt buộc")
      return
    }

    setLoading(true)
    try {
      // TODO: Call API to update user profile
      // For now, just update localStorage
      const updatedUser = {
        ...user,
        name: editForm.name.trim(),
        address: editForm.address.trim(),
        email: editForm.email.trim(),
      }
      saveUser(updatedUser)
      setUser(updatedUser)
      setIsEditing(false)
      setSuccess("Đã cập nhật thông tin thành công")
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Lỗi khi cập nhật thông tin")
    } finally {
      setLoading(false)
    }
  }


  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto"
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
            <User className="w-6 h-6 text-green-400" />
            Thông tin tài khoản
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-950/50 border border-green-500/50 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Profile Section */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-50">Thông tin cá nhân</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Sửa thông tin
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
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
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Tên
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-50">{user.name || "N/A"}</p>
                )}
              </div>

              {/* Phone (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Số điện thoại
                </label>
                <p className="text-gray-50">{user.phone || "N/A"}</p>
                <p className="text-xs text-gray-500 mt-1">Số điện thoại không thể thay đổi</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-50">{user.email || "N/A"}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Địa chỉ
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-50">{user.address || "Chưa cập nhật"}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

