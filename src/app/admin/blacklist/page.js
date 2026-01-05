"use client"

import { useState, useEffect } from 'react'
import { useRoleCheck } from '@/hooks/useRoleCheck'
import { Shield, Search, Plus, Edit, Trash2, Filter, X, Loader2, CheckCircle, XCircle, Calendar, FileText } from 'lucide-react'

export default function AdminBlacklist() {
  // Check if user has permission (only admin and super_admin)
  const { isAuthorized, isChecking } = useRoleCheck(['admin', 'super_admin'])

  const [blacklist, setBlacklist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [filterReason, setFilterReason] = useState("")
  const [filterPermanent, setFilterPermanent] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEmail, setEditingEmail] = useState(null)
  const [formData, setFormData] = useState({
    email: "",
    reason: "manual_block",
    is_permanent: false,
    blocked_until: "",
    admin_notes: "",
  })

  // Get current admin phone from localStorage
  const getAdminPhone = () => {
    if (typeof window === 'undefined') return null
    const adminData = localStorage.getItem('admin_data')
    if (adminData) {
      try {
        const admin = JSON.parse(adminData)
        return admin.phone
      } catch (e) {
        return null
      }
    }
    return null
  }

  // Fetch blacklist
  const fetchBlacklist = async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (search) params.append('search', search)
      if (filterReason) params.append('reason', filterReason)
      if (filterPermanent !== "") params.append('is_permanent', filterPermanent)

      const adminPhone = getAdminPhone()
      const headers = {
        'Content-Type': 'application/json',
      }
      if (adminPhone) {
        headers['x-admin-phone'] = adminPhone
      }

      const response = await fetch(`/api/admin/blacklist?${params}`, {
        headers
      })
      const data = await response.json()

      if (data.success) {
        setBlacklist(data.data)
        setTotalPages(data.pagination.totalPages)
        setTotal(data.pagination.total)
      } else {
        setError(data.error || "Lỗi khi lấy danh sách blacklist")
      }
    } catch (err) {
      console.error("Error fetching blacklist:", err)
      setError("Lỗi kết nối. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlacklist()
  }, [page, search, filterReason, filterPermanent])

  // Handle add to blacklist
  const handleAdd = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const adminPhone = getAdminPhone()
      const headers = {
        "Content-Type": "application/json",
      }
      if (adminPhone) {
        headers['x-admin-phone'] = adminPhone
      }

      const response = await fetch("/api/admin/blacklist", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...formData,
          blocked_until: formData.blocked_until ? new Date(formData.blocked_until).toISOString() : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setShowAddModal(false)
        setFormData({
          email: "",
          reason: "manual_block",
          is_permanent: false,
          blocked_until: "",
          admin_notes: "",
        })
        fetchBlacklist()
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("showToast", {
              detail: {
                message: "Đã thêm email vào blacklist",
                type: "success",
              },
            })
          )
        }
      } else {
        setError(data.error || "Lỗi khi thêm vào blacklist")
      }
    } catch (err) {
      console.error("Error adding to blacklist:", err)
      setError("Lỗi kết nối. Vui lòng thử lại sau.")
    }
  }

  // Handle edit
  const handleEdit = (email) => {
    const entry = blacklist.find((item) => item.email === email)
    if (entry) {
      setEditingEmail(email)
      setFormData({
        email: entry.email,
        reason: entry.reason || "manual_block",
        is_permanent: entry.is_permanent || false,
        blocked_until: entry.blocked_until
          ? new Date(entry.blocked_until).toISOString().slice(0, 16)
          : "",
        admin_notes: entry.admin_notes || "",
      })
      setShowEditModal(true)
    }
  }

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const adminPhone = getAdminPhone()
      const headers = {
        "Content-Type": "application/json",
      }
      if (adminPhone) {
        headers['x-admin-phone'] = adminPhone
      }

      const response = await fetch(`/api/admin/blacklist/${encodeURIComponent(editingEmail)}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          reason: formData.reason,
          is_permanent: formData.is_permanent,
          blocked_until: formData.blocked_until ? new Date(formData.blocked_until).toISOString() : null,
          admin_notes: formData.admin_notes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setShowEditModal(false)
        setEditingEmail(null)
        setFormData({
          email: "",
          reason: "manual_block",
          is_permanent: false,
          blocked_until: "",
          admin_notes: "",
        })
        fetchBlacklist()
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("showToast", {
              detail: {
                message: "Đã cập nhật blacklist",
                type: "success",
              },
            })
          )
        }
      } else {
        setError(data.error || "Lỗi khi cập nhật blacklist")
      }
    } catch (err) {
      console.error("Error updating blacklist:", err)
      setError("Lỗi kết nối. Vui lòng thử lại sau.")
    }
  }

  // Handle delete
  const handleDelete = async (email) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa email "${email}" khỏi blacklist?`)) {
      return
    }

    try {
      const adminPhone = getAdminPhone()
      const headers = {}
      if (adminPhone) {
        headers['x-admin-phone'] = adminPhone
      }

      const response = await fetch(`/api/admin/blacklist/${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers
      })

      const data = await response.json()

      if (data.success) {
        fetchBlacklist()
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("showToast", {
              detail: {
                message: "Đã xóa email khỏi blacklist",
                type: "success",
              },
            })
          )
        }
      } else {
        setError(data.error || "Lỗi khi xóa khỏi blacklist")
      }
    } catch (err) {
      console.error("Error deleting from blacklist:", err)
      setError("Lỗi kết nối. Vui lòng thử lại sau.")
    }
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return "Vĩnh viễn"
    return new Date(date).toLocaleString("vi-VN")
  }

  // Check if blocked
  const isBlocked = (entry) => {
    if (entry.is_permanent) return true
    if (entry.blocked_until) {
      return new Date(entry.blocked_until) > new Date()
    }
    return false
  }

  // Show loading while checking auth or fetching data
  if (isChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-muted-foreground">Đang tải...</div>
        </div>
      </div>
    )
  }

  // Don't render if not authorized
  if (!isAuthorized) {
    return null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Quản lý Blacklist Email
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý danh sách email bị chặn đặt hàng và đăng ký
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm Email
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Tìm kiếm email..."
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filter by reason */}
          <select
            value={filterReason}
            onChange={(e) => {
              setFilterReason(e.target.value)
              setPage(1)
            }}
            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tất cả lý do</option>
            <option value="too_many_orders">Quá nhiều đơn</option>
            <option value="suspicious_activity">Hoạt động đáng ngờ</option>
            <option value="manual_block">Chặn thủ công</option>
          </select>

          {/* Filter by permanent */}
          <select
            value={filterPermanent}
            onChange={(e) => {
              setFilterPermanent(e.target.value)
              setPage(1)
            }}
            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tất cả</option>
            <option value="true">Vĩnh viễn</option>
            <option value="false">Tạm thời</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 text-destructive hover:text-destructive/80"
          >
            <X className="w-4 h-4 inline" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : blacklist.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Không có email nào trong blacklist</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Lý do</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Hết hạn</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Ngày tạo</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {blacklist.map((entry) => (
                    <tr key={entry._id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm text-foreground font-mono">{entry.email}</td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        <span className="px-2 py-1 bg-muted rounded text-xs">
                          {entry.reason === 'too_many_orders' && 'Quá nhiều đơn'}
                          {entry.reason === 'suspicious_activity' && 'Hoạt động đáng ngờ'}
                          {entry.reason === 'manual_block' && 'Chặn thủ công'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {isBlocked(entry) ? (
                          <span className="flex items-center gap-1 text-red-500">
                            <XCircle className="w-4 h-4" />
                            Đang chặn
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-500">
                            <CheckCircle className="w-4 h-4" />
                            Đã hết hạn
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {entry.is_permanent ? (
                          <span className="text-red-500 font-semibold">Vĩnh viễn</span>
                        ) : entry.blocked_until ? (
                          formatDate(entry.blocked_until)
                        ) : (
                          "Vĩnh viễn"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(entry.email)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.email)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {((page - 1) * 20) + 1} - {Math.min(page * 20, total)} / {total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 bg-input border border-border rounded-lg text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 bg-input border border-border rounded-lg text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Thêm Email vào Blacklist
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setFormData({
                      email: "",
                      reason: "manual_block",
                      is_permanent: false,
                      blocked_until: "",
                      admin_notes: "",
                    })
                    setError("")
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Lý do <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    required
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="manual_block">Chặn thủ công</option>
                    <option value="too_many_orders">Quá nhiều đơn</option>
                    <option value="suspicious_activity">Hoạt động đáng ngờ</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={formData.is_permanent}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_permanent: e.target.checked, blocked_until: "" }))}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                    Chặn vĩnh viễn
                  </label>
                </div>

                {!formData.is_permanent && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Hết hạn vào
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.blocked_until}
                      onChange={(e) => setFormData(prev => ({ ...prev, blocked_until: e.target.value }))}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ghi chú (Tùy chọn)
                  </label>
                  <textarea
                    value={formData.admin_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Ghi chú về lý do chặn..."
                  />
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setFormData({
                        email: "",
                        reason: "manual_block",
                        is_permanent: false,
                        blocked_until: "",
                        admin_notes: "",
                      })
                      setError("")
                    }}
                    className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Edit className="w-5 h-5 text-primary" />
                  Sửa Blacklist
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingEmail(null)
                    setFormData({
                      email: "",
                      reason: "manual_block",
                      is_permanent: false,
                      blocked_until: "",
                      admin_notes: "",
                    })
                    setError("")
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Lý do <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    required
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="manual_block">Chặn thủ công</option>
                    <option value="too_many_orders">Quá nhiều đơn</option>
                    <option value="suspicious_activity">Hoạt động đáng ngờ</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={formData.is_permanent}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_permanent: e.target.checked, blocked_until: "" }))}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                    Chặn vĩnh viễn
                  </label>
                </div>

                {!formData.is_permanent && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Hết hạn vào
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.blocked_until}
                      onChange={(e) => setFormData(prev => ({ ...prev, blocked_until: e.target.value }))}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ghi chú (Tùy chọn)
                  </label>
                  <textarea
                    value={formData.admin_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Ghi chú về lý do chặn..."
                  />
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingEmail(null)
                      setFormData({
                        email: "",
                        reason: "manual_block",
                        is_permanent: false,
                        blocked_until: "",
                        admin_notes: "",
                      })
                      setError("")
                    }}
                    className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

