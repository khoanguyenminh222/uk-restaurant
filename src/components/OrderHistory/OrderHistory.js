"use client"

import { useState, useEffect, useRef } from "react"
import { X, Package, Calendar, DollarSign, Filter, Loader2, Eye, XCircle, Clock, CheckCircle, Mail, History, Edit2, CheckCircle2, Truck } from "lucide-react"
import { getUser } from "@/utils/user"
import { formatCurrency } from "@/utils/helpers"

const STATUS_CONFIG = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-500/20 text-blue-600 border-blue-500/50', icon: CheckCircle2 },
  preparing: { label: 'Đang chuẩn bị', color: 'bg-orange-500/20 text-orange-600 border-orange-500/50', icon: Package },
  ready: { label: 'Sẵn sàng', color: 'bg-green-500/20 text-green-600 border-green-500/50', icon: CheckCircle },
  delivered: { label: 'Đã giao', color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/50', icon: Truck },
  completed: { label: 'Hoàn thành', color: 'bg-green-600/20 text-green-700 border-green-600/50', icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy', color: 'bg-red-500/20 text-red-600 border-red-500/50', icon: XCircle },
};

export default function OrderHistory({ isOpen, onClose }) {
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [error, setError] = useState("")
  const modalRef = useRef(null)

  // Orders state
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState("all") // all, pending, confirmed, completed, cancelled

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const detailModalRef = useRef(null)

  // Load user info and orders
  useEffect(() => {
    if (isOpen) {
      const currentUser = getUser()
      if (currentUser && currentUser.user_id) {
        // Load orders using user_id
        loadOrders(currentUser.user_id)
      } else {
        // User not logged in, close modal
        onClose()
      }
    }
  }, [isOpen, onClose])

  // Filter orders by status
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter((order) => order.status === statusFilter))
    }
  }, [orders, statusFilter])

  // Load orders
  const loadOrders = async (userId) => {
    if (!userId) return

    setOrdersLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/orders?user_id=${userId}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.data || [])
      } else {
        setError("Không thể tải lịch sử đơn hàng")
      }
    } catch (err) {
      console.error("Error loading orders:", err)
      setError("Lỗi khi tải lịch sử đơn hàng")
    } finally {
      setOrdersLoading(false)
    }
  }

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close main modal if detail modal is open
      if (showDetailModal) {
        return
      }
      // Don't close if clicking inside main modal
      if (modalRef.current && modalRef.current.contains(event.target)) {
        return
      }
      // Close main modal only if clicking outside and detail modal is not open
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
  }, [isOpen, onClose, showDetailModal])

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      case "confirmed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      case "preparing":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50"
      case "ready":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
      case "delivered":
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      pending: "Chờ xử lý",
      confirmed: "Đã xác nhận",
      preparing: "Đang chuẩn bị",
      ready: "Sẵn sàng",
      delivered: "Đã giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    }
    return labels[status] || status
  }

  // Handle view detail
  const handleViewDetail = async (order) => {
    try {
      // Fetch full order details to get status_history and change_history
      const response = await fetch(`/api/orders/${order.order_id}`)
      const data = await response.json()
      
      if (data.success) {
        setSelectedOrder(data.data)
        setShowDetailModal(true)
      } else {
        // Fallback to order from list if API fails
        setSelectedOrder(order)
        setShowDetailModal(true)
      }
    } catch (err) {
      console.error("Error fetching order detail:", err)
      // Fallback to order from list if API fails
      setSelectedOrder(order)
      setShowDetailModal(true)
    }
  }

  // Handle cancel order click
  const handleCancelClick = () => {
    if (!selectedOrder || selectedOrder.status !== 'pending') {
      return
    }
    setShowCancelModal(true)
  }

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!selectedOrder || selectedOrder.status !== 'pending') {
      return
    }

    setShowCancelModal(false)
    setCancelling(true)
    try {
      const response = await fetch(`/api/orders/${selectedOrder.order_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: "cancelled", 
          changed_by: "customer",
          cancel_reason: cancelReason.trim() || '',
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update order in local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.order_id === selectedOrder.order_id
              ? { ...order, status: "cancelled" }
              : order
          )
        )
        setSelectedOrder(prev => ({ ...prev, status: "cancelled" }))
        
        // Show success message
        window.dispatchEvent(
          new CustomEvent("showToast", {
            detail: {
              message: "Đơn hàng đã được hủy thành công.",
              type: "success",
            },
          })
        )
      } else {
        setError(data.error || "Không thể hủy đơn hàng.")
      }
    } catch (err) {
      console.error("Error cancelling order:", err)
      setError("Lỗi kết nối. Vui lòng thử lại sau.")
    } finally {
      setCancelling(false)
      setCancelReason('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors z-10 cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-border bg-primary/10 py-4 px-6">
          <h2 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Lịch sử đơn hàng
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Order History Section */}
          <div className="bg-muted/50 rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Danh sách đơn hàng
              </h3>
              
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-input border border-border rounded-lg text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">Tất cả</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="preparing">Đang chuẩn bị</option>
                  <option value="ready">Sẵn sàng</option>
                  <option value="delivered">Đã giao</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {statusFilter === "all" ? "Chưa có đơn hàng nào" : "Không có đơn hàng với trạng thái này"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="bg-card/50 rounded-lg p-4 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm font-mono font-semibold text-primary">
                            {order.order_id}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(order.total_price)}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="mt-3 space-y-1">
                          {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                            order.items.map((item, index) => (
                              <p key={index} className="text-sm text-card-foreground">
                                {item.name} × {item.quantity} - {formatCurrency((item.price || 0) * item.quantity)}
                              </p>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Không có sản phẩm nào trong đơn hàng</p>
                          )}
                        </div>

                        {order.notes && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Ghi chú: {order.notes}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(order)}
                          className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Chi tiết</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" 
          style={{ zIndex: 60 }}
          onClick={(e) => {
            // Close detail modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowDetailModal(false)
              setSelectedOrder(null)
            }
          }}
        >
          <div 
            ref={detailModalRef}
            className="bg-card rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto relative border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-card-foreground">Chi tiết đơn hàng</h2>
                </div>
                <div className="flex items-center gap-2">
                  {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
                    <button
                      onClick={() => setShowHistoryModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium cursor-pointer"
                    >
                      <History className="w-4 h-4" />
                      <span>Lịch sử thay đổi</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      setSelectedOrder(null)
                    }}
                    className="p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    aria-label="Đóng"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
                    <p className="font-mono font-semibold text-primary">{selectedOrder.order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ngày đặt</p>
                    <p className="font-medium text-card-foreground">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}
                    >
                      {selectedOrder.status === 'pending' && <Clock className="w-3 h-3" />}
                      {selectedOrder.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                      {(selectedOrder.status === 'delivered' || selectedOrder.status === 'completed') && <CheckCircle className="w-3 h-3" />}
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tổng tiền</p>
                    <p className="font-bold text-lg text-primary">{formatCurrency(selectedOrder.total_price || 0)}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold text-card-foreground mb-3">Thông tin khách hàng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tên</p>
                      <p className="font-medium text-card-foreground">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Số điện thoại</p>
                      <a href={`tel:${selectedOrder.customer_phone}`} className="font-medium text-primary hover:underline">
                        {selectedOrder.customer_phone}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      {selectedOrder.customer_email ? (
                        <a href={`mailto:${selectedOrder.customer_email}`} className="font-medium text-primary hover:underline">
                          {selectedOrder.customer_email}
                        </a>
                      ) : (
                        <p className="font-medium text-card-foreground">N/A</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Địa chỉ</p>
                      <p className="font-medium text-card-foreground">{selectedOrder.customer_address || 'Tại quán'}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold text-card-foreground mb-3">Danh sách sản phẩm</h3>
                  {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium text-card-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">x{item.quantity} - {formatCurrency(item.price || 0)}</p>
                          </div>
                          <p className="font-medium text-primary">{formatCurrency((item.price || 0) * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-muted-foreground">Không có sản phẩm nào trong đơn hàng</p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="border-t border-border pt-4">
                    <h3 className="font-semibold text-card-foreground mb-3">Ghi chú</h3>
                    <p className="text-sm text-card-foreground">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Cancel Button (only if status is pending) */}
                {selectedOrder.status === 'pending' && (
                  <div className="border-t border-border pt-4 cursor-pointer">
                    <button
                      onClick={handleCancelClick}
                      disabled={cancelling}
                      className="w-full py-3 bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Hủy đơn hàng</span>
                    </button>
                  </div>
                )}

                {/* Cancelled Status Badge */}
                {selectedOrder.status === 'cancelled' && (
                  <div className="border-t border-border pt-4">
                    <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                      <p className="text-destructive font-medium flex items-center gap-2 mb-2">
                        <XCircle className="w-5 h-5" />
                        Đơn hàng đã được hủy
                      </p>
                      {selectedOrder.cancel_reason && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-1">Lý do hủy:</p>
                          <p className="text-sm text-card-foreground">{selectedOrder.cancel_reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-70 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCancelModal(false)
              setCancelReason('')
            }
          }}
        >
          <div 
            className="bg-card rounded-lg max-w-md w-full p-6 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-card-foreground mb-4">Xác nhận hủy đơn hàng</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Bạn có chắc chắn muốn hủy đơn hàng <span className="font-semibold text-card-foreground">{selectedOrder?.order_id}</span>?
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Hành động này không thể hoàn tác.
            </p>

            <div className="mb-4">
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

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancelReason('')
                }}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium cursor-pointer"
              >
                Không, giữ lại
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang hủy...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Có, hủy đơn hàng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status History Modal */}
      {showHistoryModal && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 70 }}
          onClick={() => setShowHistoryModal(false)}
        >
          <div 
            className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-card-foreground">Lịch sử thay đổi</h2>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
                <p className="font-medium text-card-foreground">{selectedOrder.order_id}</p>
              </div>

              {/* Get current user for comparison */}
              {(() => {
                const currentUser = getUser();
                const currentUserId = currentUser?.user_id;

                return (
                  <>
                    {/* Change History */}
                    {selectedOrder.change_history && selectedOrder.change_history.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-card-foreground">Lịch sử chỉnh sửa</h3>
                        {selectedOrder.change_history.map((changeEntry, index) => {
                          const isLast = index === selectedOrder.change_history.length - 1;
                          const changedByDetail = changeEntry.changed_by_detail;
                          const isUserChange = changedByDetail?.type === 'user' && changedByDetail?.user_id === currentUserId;
                          const isAdminOrSystem = changedByDetail?.type === 'admin' || changedByDetail?.type === 'system';
                          
                          return (
                            <div key={index} className="relative border-l-2 border-border pl-4 pb-4">
                              <div className="flex items-start gap-3">
                                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                  isLast 
                                    ? 'bg-primary border-primary text-primary-foreground' 
                                    : 'bg-muted border-border text-muted-foreground'
                                }`}>
                                  <Edit2 className="w-3 h-3" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-card-foreground">
                                      {formatDate(changeEntry.changed_at)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {isUserChange ? (
                                        'Của bạn'
                                      ) : isAdminOrSystem ? (
                                        changedByDetail?.type === 'admin' ? 'Admin' : 'Hệ thống'
                                      ) : (
                                        changeEntry.changed_by || 'N/A'
                                      )}
                                    </span>
                                  </div>
                                  
                                  {/* Display changes */}
                                  {changeEntry.changes && changeEntry.changes.length > 0 && (
                                    <div className="space-y-2 mt-2">
                                      {changeEntry.changes.map((change, changeIndex) => {
                                        const getFieldLabel = (field) => {
                                          const labels = {
                                            customer_name: 'Tên khách hàng',
                                            customer_phone: 'Số điện thoại',
                                            customer_address: 'Địa chỉ',
                                            total_price: 'Tổng tiền',
                                            status: 'Trạng thái',
                                            admin_notes: 'Ghi chú admin',
                                            items: 'Danh sách sản phẩm',
                                          };
                                          return labels[field] || field;
                                        };
                                        
                                        const field = change.field;
                                        const oldValue = change.old_value;
                                        const newValue = change.new_value;
                                        
                                        const formatDisplayValue = (value, fieldName) => {
                                          if (value === null || value === undefined || value === '') return '(trống)';
                                          if (fieldName === 'total_price') return formatCurrency(parseFloat(value) || 0);
                                          if (fieldName === 'status') {
                                            const StatusIcon = STATUS_CONFIG[value]?.icon || Clock;
                                            return (
                                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${
                                                STATUS_CONFIG[value]?.color || 'bg-gray-500/20 text-gray-600 border-gray-500/50'
                                              }`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {STATUS_CONFIG[value]?.label || value}
                                              </span>
                                            );
                                          }
                                          if (fieldName === 'items') {
                                            try {
                                              const items = typeof value === 'string' ? JSON.parse(value) : value;
                                              if (Array.isArray(items)) {
                                                return `${items.length} sản phẩm: ${items.map(i => `${i.name || 'N/A'} (x${i.quantity || 1})`).join(', ')}`;
                                              }
                                            } catch (e) {
                                              return String(value);
                                            }
                                          }
                                          return String(value);
                                        };
                                        
                                        return (
                                          <div key={changeIndex} className="bg-muted rounded-lg p-3 border border-border">
                                            <p className="text-sm font-medium text-card-foreground mb-2">
                                              {getFieldLabel(field)}
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                              <div>
                                                <p className="text-xs text-muted-foreground mb-1">Giá trị cũ:</p>
                                                <div className="text-card-foreground break-all">
                                                  {(() => {
                                                    const formatted = formatDisplayValue(oldValue, field);
                                                    return typeof formatted === 'string' ? (
                                                      <span className="line-through text-muted-foreground">{formatted}</span>
                                                    ) : (
                                                      formatted
                                                    );
                                                  })()}
                                                </div>
                                              </div>
                                              <div>
                                                <p className="text-xs text-muted-foreground mb-1">Giá trị mới:</p>
                                                <div className="text-card-foreground break-all">
                                                  {(() => {
                                                    const formatted = formatDisplayValue(newValue, field);
                                                    return typeof formatted === 'string' ? (
                                                      <span className="text-primary font-medium">{formatted}</span>
                                                    ) : (
                                                      formatted
                                                    );
                                                  })()}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground text-sm">Chưa có lịch sử chỉnh sửa</p>
                      </div>
                    )}

                    {/* Status History */}
                    {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
                      <div className="space-y-4 border-t border-border pt-4">
                        <h3 className="text-lg font-semibold text-card-foreground">Lịch sử thay đổi trạng thái</h3>
                        <div className="space-y-3">
                          {selectedOrder.status_history.map((history, index) => {
                            const StatusIcon = STATUS_CONFIG[history.status]?.icon || Clock;
                            const isLast = index === selectedOrder.status_history.length - 1;
                            const changedByDetail = history.changed_by_detail;
                            const isUserChange = changedByDetail?.type === 'user' && changedByDetail?.user_id === currentUserId;
                            const isAdminOrSystem = changedByDetail?.type === 'admin' || changedByDetail?.type === 'system';
                            
                            return (
                              <div key={index} className="relative border-l-2 border-border pl-4 pb-4">
                                <div className="flex items-start gap-3">
                                  <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                    isLast 
                                      ? 'bg-primary border-primary text-primary-foreground' 
                                      : 'bg-muted border-border text-muted-foreground'
                                  }`}>
                                    <StatusIcon className="w-3 h-3" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${
                                        STATUS_CONFIG[history.status]?.color || 'bg-gray-500/20 text-gray-600 border-gray-500/50'
                                      }`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {STATUS_CONFIG[history.status]?.label || history.status}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(history.changed_at)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Thay đổi bởi: <span className="font-medium text-card-foreground">
                                        {isUserChange ? (
                                          'Của bạn'
                                        ) : isAdminOrSystem ? (
                                          changedByDetail?.type === 'admin' ? 'Admin' : 'Hệ thống'
                                        ) : (
                                          history.changed_by || 'N/A'
                                        )}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

