"use client"

import { useState, useEffect, useRef } from 'react'
import { useRoleCheck } from '@/hooks/useRoleCheck'
import { Shield, Search, Plus, Edit, Trash2, Filter, X, Loader2, CheckCircle, XCircle, Calendar, FileText, RotateCcw, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react'
import Toast from '@/components/Toast/Toast';
import { adminFetch } from '@/lib/adminAuth';

export default function AdminBlacklist() {
  // Check if user has permission (only admin and super_admin)
  const { isAuthorized, isChecking } = useRoleCheck(['admin', 'super_admin'])

  const [blacklist, setBlacklist] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState("")
  const [filterReason, setFilterReason] = useState("")
  const [filterPermanent, setFilterPermanent] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingEmail, setEditingEmail] = useState(null)
  const [emailToDelete, setEmailToDelete] = useState(null)
  const addModalRef = useRef(null)
  const editModalRef = useRef(null)
  const deleteModalRef = useRef(null)
  const [toast, setToast] = useState({ message: '', isVisible: false, type: 'success' })
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

      const response = await adminFetch(`/api/admin/blacklist?${params}`, {
        headers
      })
      const data = await response.json()

      if (data.success) {
        setBlacklist(data.data)
        setStats(data.stats)
        setTotalPages(data.pagination.totalPages)
        setTotal(data.pagination.total)
      } else {
        setToast({
          message: data.error || "Lỗi khi lấy danh sách blacklist",
          type: "error",
          isVisible: true
        })
      }
    } catch (err) {
      console.error("Error fetching blacklist:", err)
      setToast({
        message: "Lỗi kết nối. Vui lòng thử lại sau.",
        type: "error",
        isVisible: true
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle click outside to close modals
  useEffect(() => {
    function handleClickOutside(event) {
      // Don't close if an operation is active
      if (adding || updating || deleting) return;

      if (showAddModal && addModalRef.current && !addModalRef.current.contains(event.target)) {
        setShowAddModal(false)
        setFormData({
          email: "",
          reason: "manual_block",
          is_permanent: false,
          blocked_until: "",
          admin_notes: "",
        })
      }
      if (showEditModal && editModalRef.current && !editModalRef.current.contains(event.target)) {
        setShowEditModal(false)
        setEditingEmail(null)
        setFormData({
          email: "",
          reason: "manual_block",
          is_permanent: false,
          blocked_until: "",
          admin_notes: "",
        })
      }
      if (showDeleteModal && deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowDeleteModal(false)
        setEmailToDelete(null)
      }
    }

    if (showAddModal || showEditModal || showDeleteModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddModal, showEditModal, showDeleteModal, adding, updating, deleting]);

  // Handle scroll lock when modal is open
  useEffect(() => {
    if (showAddModal || showEditModal || showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddModal, showEditModal, showDeleteModal]);

  useEffect(() => {
    fetchBlacklist()
  }, [page, search, filterReason, filterPermanent])

  // Handle add to blacklist
  const handleAdd = async (e) => {
    e.preventDefault()

    setAdding(true)
    try {
      const adminPhone = getAdminPhone()
      const headers = {
        "Content-Type": "application/json",
      }
      if (adminPhone) {
        headers['x-admin-phone'] = adminPhone
      }

      const response = await adminFetch("/api/admin/blacklist", {
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
        setToast({
          message: "Đã thêm email vào blacklist",
          type: "success",
          isVisible: true
        })
      } else {
        setToast({
          message: data.error || "Lỗi khi thêm vào blacklist",
          type: "error",
          isVisible: true
        })
      }
    } catch (err) {
      console.error("Error adding to blacklist:", err)
      setToast({
        message: "Lỗi kết nối. Vui lòng thử lại sau.",
        type: "error",
        isVisible: true
      })
    } finally {
      setAdding(false)
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

    setUpdating(true)
    try {
      const adminPhone = getAdminPhone()
      const headers = {
        "Content-Type": "application/json",
      }
      if (adminPhone) {
        headers['x-admin-phone'] = adminPhone
      }

      const response = await adminFetch(`/api/admin/blacklist/${encodeURIComponent(editingEmail)}`, {
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
        setToast({
          message: "Đã cập nhật blacklist",
          type: "success",
          isVisible: true
        })
      } else {
        setToast({
          message: data.error || "Lỗi khi cập nhật blacklist",
          type: "error",
          isVisible: true
        })
      }
    } catch (err) {
      console.error("Error updating blacklist:", err)
      setToast({
        message: "Lỗi kết nối. Vui lòng thử lại sau.",
        type: "error",
        isVisible: true
      })
    } finally {
      setUpdating(false)
    }
  }

  // Handle delete - open modal
  const handleDelete = (email) => {
    setEmailToDelete(email)
    setShowDeleteModal(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!emailToDelete) return

    setDeleting(true)
    try {
      const adminPhone = getAdminPhone()
      const headers = {}
      if (adminPhone) {
        headers['x-admin-phone'] = adminPhone
      }

      const response = await adminFetch(`/api/admin/blacklist/${encodeURIComponent(emailToDelete)}`, {
        method: "DELETE",
        headers
      })

      const data = await response.json()

      if (data.success) {
        setShowDeleteModal(false)
        setEmailToDelete(null)
        fetchBlacklist()
        setToast({
          message: "Đã xóa email khỏi blacklist",
          type: "success",
          isVisible: true
        })
      } else {
        setToast({
          message: data.error || "Lỗi khi xóa khỏi blacklist",
          type: "error",
          isVisible: true
        })
      }
    } catch (err) {
      console.error("Error deleting from blacklist:", err)
      setToast({
        message: "Lỗi kết nối. Vui lòng thử lại sau.",
        type: "error",
        isVisible: true
      })
    } finally {
      setDeleting(false)
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Quản lý Blacklist</h1>
                <p className="text-sm text-muted-foreground mt-1">Chặn và quản lý các email vi phạm chính sách cửa hàng</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 hover:translate-y-[-2px] active:translate-y-[0] transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm Email</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {[
              {
                label: 'Tổng số email',
                value: stats.total || 0,
                icon: Shield,
                color: 'text-primary',
                bgColor: 'bg-primary/10',
                borderColor: 'border-primary/20',
                info: 'Tổng số email đang có trong danh sách chặn'
              },
              {
                label: 'Chặn vĩnh viễn',
                value: stats.permanent || 0,
                icon: XCircle,
                color: 'text-destructive',
                bgColor: 'bg-destructive/10',
                borderColor: 'border-destructive/20',
                info: 'Số lượng email bị chặn không thời hạn'
              },
              {
                label: 'Đang hoạt động',
                value: stats.active || 0,
                icon: CheckCircle,
                color: 'text-emerald-500',
                bgColor: 'bg-emerald-500/10',
                borderColor: 'border-emerald-500/20',
                info: 'Email đang trong thời gian bị chặn'
              },
              {
                label: 'Đã hết hạn',
                value: stats.expired || 0,
                icon: Calendar,
                color: 'text-amber-500',
                bgColor: 'bg-amber-500/10',
                borderColor: 'border-amber-500/20',
                info: 'Email đã quá hạn chặn nhưng vẫn ở trong danh sách'
              }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-card rounded-xl sm:rounded-2xl border border-border p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-all group relative animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Background Wave */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]">
                  <div className={`absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 ${stat.bgColor} opacity-20 rounded-bl-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 transition-transform group-hover:scale-110`} />
                </div>

                <div className="flex items-start justify-between mb-3 sm:mb-4 relative z-10">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bgColor} ${stat.borderColor} border rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm`}>
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-current" />
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-medium leading-tight text-right flex-1 ml-3 pt-0.5">
                    {stat.info}
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5 sm:mt-1">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-8 shadow-sm transition-all duration-300">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 flex gap-3">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm kiếm email trong danh sách chặn..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                />
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`lg:hidden relative flex items-center justify-center w-12 h-12 rounded-xl border transition-all active:scale-95 ${showMobileFilters || filterReason !== '' || filterPermanent !== ''
                  ? 'bg-primary/10 border-primary/30 text-primary shadow-sm'
                  : 'bg-muted/40 border-border text-muted-foreground'
                  }`}
              >
                <Filter className="w-5 h-5" />
                {(filterReason !== '' || filterPermanent !== '') && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full ring-2 ring-background shadow-sm">
                    {[filterReason !== '', filterPermanent !== ''].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Filters (Always visible on large screens) */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Reason Filter */}
              <select
                value={filterReason}
                onChange={(e) => {
                  setFilterReason(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[160px]"
              >
                <option value="">Tất cả lý do</option>
                <option value="manual_block">Chặn thủ công</option>
                <option value="too_many_orders">Quá nhiều đơn</option>
                <option value="suspicious_activity">Hoạt động đáng ngờ</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterPermanent}
                onChange={(e) => {
                  setFilterPermanent(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[140px]"
              >
                <option value="">Tất cả</option>
                <option value="true">Vĩnh viễn</option>
                <option value="false">Tạm thời</option>
              </select>

              <div className="h-10 w-[1px] bg-border/60 mx-1" />
              <button
                onClick={() => {
                  setSearch('');
                  setFilterReason('');
                  setFilterPermanent('');
                  setPage(1);
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                Xóa lọc
              </button>
            </div>
          </div>

          {/* Mobile Filters (Collapsible) */}
          <div className={`lg:hidden grid transition-all duration-300 ${showMobileFilters ? 'grid-rows-[1fr] mt-4 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="grid grid-cols-2 gap-3 pb-2">
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1 mb-1.5 block">Lý do</label>
                  <select
                    value={filterReason}
                    onChange={(e) => {
                      setFilterReason(e.target.value)
                      setPage(1)
                    }}
                    className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    <option value="">Tất cả</option>
                    <option value="manual_block">Thủ công</option>
                    <option value="too_many_orders">Nhiều đơn</option>
                    <option value="suspicious_activity">Đáng ngờ</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1 mb-1.5 block">Thời hạn</label>
                  <select
                    value={filterPermanent}
                    onChange={(e) => {
                      setFilterPermanent(e.target.value)
                      setPage(1)
                    }}
                    className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    <option value="">Tất cả</option>
                    <option value="true">Vĩnh viễn</option>
                    <option value="false">Tạm thời</option>
                  </select>
                </div>
                <div className="col-span-2 mt-2">
                  <button
                    onClick={() => {
                      setSearch('');
                      setFilterReason('');
                      setFilterPermanent('');
                      setPage(1);
                      setShowMobileFilters(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-muted/40 text-muted-foreground font-bold text-sm rounded-xl hover:bg-destructive/5 hover:text-destructive transition-all active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Thiết lập lại bộ lọc
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm mb-8">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : blacklist.length === 0 ? (
            <div className="p-16 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Không tìm thấy kết quả</h3>
              <p className="text-muted-foreground mt-1 max-w-xs mx-auto">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn</p>
              {(search || filterReason || filterPermanent) && (
                <button
                  onClick={() => {
                    setSearch('')
                    setFilterReason('')
                    setFilterPermanent('')
                    setPage(1)
                  }}
                  className="mt-6 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 rounded-xl transition-all"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/50">
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lý do</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hết hạn</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {blacklist.map((entry, idx) => (
                      <tr
                        key={entry._id}
                        className="group hover:bg-muted/30 transition-colors animate-in fade-in slide-in-from-left-4 duration-300"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground font-mono">{entry.email}</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">ID: {entry._id.slice(-8)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${entry.reason === 'too_many_orders' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                            entry.reason === 'suspicious_activity' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                              'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            }`}>
                            {entry.reason === 'too_many_orders' && 'Quá nhiều đơn'}
                            {entry.reason === 'suspicious_activity' && 'Hoạt động đáng ngờ'}
                            {entry.reason === 'manual_block' && 'Chặn thủ công'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {isBlocked(entry) ? (
                            <span className="flex items-center gap-1.5 text-destructive font-bold text-[13px]">
                              <XCircle className="w-4 h-4" />
                              Đang chặn
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-emerald-500 font-bold text-[13px]">
                              <CheckCircle className="w-4 h-4" />
                              Hết hạn
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {entry.is_permanent ? (
                            <span className="text-destructive font-bold text-[13px]">Vĩnh viễn</span>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-[13px]">{formatDate(entry.blocked_until)}</span>
                              <span className="text-[10px] flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                Tạm thời
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 transition-opacity">
                            <button
                              onClick={() => handleEdit(entry.email)}
                              className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all active:scale-95"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.email)}
                              className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-95"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-border/50">
                {blacklist.map((entry, idx) => (
                  <div
                    key={entry._id}
                    className="p-4 active:bg-muted/30 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground font-mono break-all">{entry.email}</span>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${entry.reason === 'too_many_orders' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                            entry.reason === 'suspicious_activity' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                              'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            }`}>
                            {entry.reason === 'too_many_orders' && 'Quá nhiều đơn'}
                            {entry.reason === 'suspicious_activity' && 'Đáng ngờ'}
                            {entry.reason === 'manual_block' && 'Thủ công'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(entry.email)}
                          className="p-2.5 text-primary active:bg-primary/10 rounded-xl transition-all"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.email)}
                          className="p-2.5 text-destructive active:bg-destructive/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-muted/30 rounded-xl border border-border/50">
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Trạng thái</span>
                        {isBlocked(entry) ? (
                          <span className="flex items-center gap-1.5 text-destructive font-bold text-xs uppercase tracking-tight">
                            <XCircle className="w-3.5 h-3.5" />
                            Đang chặn
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs uppercase tracking-tight">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Hết hạn
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Thời điểm hết hạn</span>
                        {entry.is_permanent ? (
                          <span className="text-destructive font-bold text-xs uppercase tracking-tight">Vĩnh viễn</span>
                        ) : (
                          <span className="text-foreground font-bold text-[11px] leading-tight block">
                            {formatDate(entry.blocked_until)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Section */}
              {totalPages > 1 && (
                <div className="p-4 sm:p-6 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium order-2 sm:order-1">
                    Hiển thị <span className="text-foreground font-bold">{((page - 1) * 20) + 1}</span> - <span className="text-foreground font-bold">{Math.min(page * 20, total)}</span> của <span className="text-foreground font-bold">{total}</span> email
                  </p>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm font-bold text-foreground hover:bg-muted transition-all disabled:opacity-40 active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Trước
                    </button>
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Simple pagination logic for 5 pages
                        let pageNum = i + 1;
                        if (totalPages > 5 && page > 3) {
                          pageNum = page - 3 + i + 1;
                          if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                        }
                        if (pageNum <= 0) return null;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all ${page === pageNum
                              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90'
                              : 'bg-card border border-border text-muted-foreground hover:bg-muted'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm font-bold text-foreground hover:bg-muted transition-all disabled:opacity-40 active:scale-95"
                    >
                      Sau
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300">
            <div
              ref={addModalRef}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Thêm Blacklist</h2>
                      <p className="text-xs text-muted-foreground">Chặn email mới vào hệ thống</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (adding) return;
                      setShowAddModal(false)
                      setFormData({ email: "", reason: "manual_block", is_permanent: false, blocked_until: "", admin_notes: "" })
                    }}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Email <span className="text-destructive">*</span></label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      placeholder="ví dụ: customer@email.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Lý do chặn <span className="text-destructive">*</span></label>
                    <select
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer outline-none"
                    >
                      <option value="manual_block">Chặn thủ công</option>
                      <option value="too_many_orders">Đặt quá nhiều đơn (Spam)</option>
                      <option value="suspicious_activity">Hoạt động đáng ngờ</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                    <input
                      type="checkbox"
                      id="is_permanent_add"
                      checked={formData.is_permanent}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_permanent: e.target.checked, blocked_until: "" }))}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <label htmlFor="is_permanent_add" className="text-sm font-medium text-foreground cursor-pointer select-none">
                      Chặn vĩnh viễn
                    </label>
                  </div>

                  {!formData.is_permanent && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Hết hạn vào</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="datetime-local"
                          value={formData.blocked_until}
                          onChange={(e) => setFormData(prev => ({ ...prev, blocked_until: e.target.value }))}
                          className="w-full pl-11 pr-4 py-3 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Ghi chú nội bộ</label>
                    <textarea
                      value={formData.admin_notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                      placeholder="Ghi chú thêm về lý do chặn..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      disabled={adding}
                      className="flex-1 px-4 py-3 bg-muted border border-border text-foreground font-bold text-sm rounded-xl hover:bg-muted/80 transition-all active:scale-95 disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={adding}
                      className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {adding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        'Xác nhận thêm'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300">
            <div
              ref={editModalRef}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                      <Edit className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Cập nhật Chặn</h2>
                      <p className="text-xs text-muted-foreground font-mono">{editingEmail}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Lý do chặn <span className="text-destructive">*</span></label>
                    <select
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer outline-none"
                    >
                      <option value="manual_block">Chặn thủ công</option>
                      <option value="too_many_orders">Đặt quá nhiều đơn (Spam)</option>
                      <option value="suspicious_activity">Hoạt động đáng ngờ</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                    <input
                      type="checkbox"
                      id="is_permanent_edit"
                      checked={formData.is_permanent}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_permanent: e.target.checked, blocked_until: "" }))}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <label htmlFor="is_permanent_edit" className="text-sm font-medium text-foreground cursor-pointer select-none">
                      Chặn vĩnh viễn
                    </label>
                  </div>

                  {!formData.is_permanent && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Hết hạn vào</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="datetime-local"
                          value={formData.blocked_until}
                          onChange={(e) => setFormData(prev => ({ ...prev, blocked_until: e.target.value }))}
                          className="w-full pl-11 pr-4 py-3 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Ghi chú nội bộ</label>
                    <textarea
                      value={formData.admin_notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                      placeholder="Ghi chú thêm về lý do chặn..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      disabled={updating}
                      className="flex-1 px-4 py-3 bg-muted border border-border text-foreground font-bold text-sm rounded-xl hover:bg-muted/80 transition-all active:scale-95 disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        'Cập nhật'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300">
            <div
              ref={deleteModalRef}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-300 overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Xác nhận bỏ chặn?</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Email <span className="text-foreground font-bold font-mono">{emailToDelete}</span> sẽ có thể tiếp tục sử dụng dịch vụ.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 bg-muted border border-border text-foreground font-bold text-sm rounded-xl hover:bg-muted/80 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 bg-destructive text-destructive-foreground font-bold text-sm rounded-xl shadow-lg shadow-destructive/20 hover:bg-destructive/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Xác nhận xóa'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          isVisible={toast.isVisible}
          type={toast.type}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
      </div>
    </div>
  );
}

