"use client"

import { useState, useEffect, useRef } from "react"
import { X, Package, Calendar, DollarSign, Filter, Loader2 } from "lucide-react"
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

  // Load user info and orders
  useEffect(() => {
    if (isOpen) {
      const currentUser = getUser()
      if (currentUser) {
        // Load orders
        loadOrders(currentUser.phone)
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
  const loadOrders = async (phone) => {
    if (!phone) return

    setOrdersLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/orders?phone=${phone}`)
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

  if (!isOpen) return null

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
            <Package className="w-6 h-6 text-green-400" />
            Lịch sử đơn hàng
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Order History Section */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-50 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-400" />
                Danh sách đơn hàng
              </h3>
              
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                <Loader2 className="w-8 h-8 animate-spin text-green-400" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  {statusFilter === "all" ? "Chưa có đơn hàng nào" : "Không có đơn hàng với trạng thái này"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm font-mono font-semibold text-green-400">
                            {order.order_id}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-400">
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
                              <p key={index} className="text-sm text-gray-300">
                                {item.tên_món} × {item.quantity} - {formatCurrency(item.giá * item.quantity)}
                              </p>
                            ))
                          ) : (
                            // Single item
                            <p className="text-sm text-gray-300">
                              {order.tên_món} × {order.quantity || 1} - {formatCurrency((order.giá || 0) * (order.quantity || 1))}
                            </p>
                          )}
                        </div>

                        {order.notes && (
                          <p className="text-xs text-gray-500 mt-2">
                            Ghi chú: {order.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

