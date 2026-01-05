"use client"

import { useState, useEffect, useRef } from "react"
import { X, Package, Calendar, DollarSign, Filter, Loader2, Eye, XCircle, Clock, CheckCircle, Mail } from "lucide-react"
import { getUser } from "@/utils/user"
import { formatCurrency } from "@/utils/helpers"

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
  const handleViewDetail = (order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!selectedOrder || selectedOrder.status !== 'pending') {
      return
    }

    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      return
    }

    setCancelling(true)
    try {
      const response = await fetch(`/api/orders/${selectedOrder.order_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled", changed_by: "customer" }),
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
                          {order.items && order.items.length > 0 ? (
                            // Multiple items
                            order.items.map((item, index) => (
                              <p key={index} className="text-sm text-card-foreground">
                                {item.tên_món} × {item.quantity} - {formatCurrency(item.giá * item.quantity)}
                              </p>
                            ))
                          ) : (
                            // Single item
                            <p className="text-sm text-card-foreground">
                              {order.tên_món} × {order.quantity || 1} - {formatCurrency((order.giá || 0) * (order.quantity || 1))}
                            </p>
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
                          className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors flex items-center gap-2"
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
            <button
              onClick={() => {
                setShowDetailModal(false)
                setSelectedOrder(null)
              }}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors z-10 cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-card-foreground">Chi tiết đơn hàng</h2>
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
                  <h3 className="font-semibold text-card-foreground mb-3">Danh sách món</h3>
                  {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium text-card-foreground">{item.tên_món}</p>
                            <p className="text-sm text-muted-foreground">x{item.quantity} - {formatCurrency(item.giá)}</p>
                          </div>
                          <p className="font-medium text-primary">{formatCurrency(item.giá * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium text-card-foreground">{selectedOrder.tên_món || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">x{selectedOrder.quantity || 1} - {formatCurrency(selectedOrder.giá || 0)}</p>
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

                {/* Cancelled Status Badge */}
                {selectedOrder.status === 'cancelled' && (
                  <div className="border-t border-border pt-4">
                    <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                      <p className="text-destructive font-medium flex items-center gap-2">
                        <XCircle className="w-5 h-5" />
                        Đơn hàng đã được hủy
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

