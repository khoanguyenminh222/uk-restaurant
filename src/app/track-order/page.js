"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Package, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { formatCurrency } from "@/utils/helpers"

const statusConfig = {
  pending: {
    label: "Chờ xác nhận",
    color: "text-yellow-400",
    bgColor: "bg-yellow-950/30",
    borderColor: "border-yellow-500/50",
    icon: Clock,
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "text-blue-400",
    bgColor: "bg-blue-950/30",
    borderColor: "border-blue-500/50",
    icon: CheckCircle,
  },
  preparing: {
    label: "Đang chuẩn bị",
    color: "text-orange-400",
    bgColor: "bg-orange-950/30",
    borderColor: "border-orange-500/50",
    icon: Clock,
  },
  ready: {
    label: "Sẵn sàng",
    color: "text-green-400",
    bgColor: "bg-green-950/30",
    borderColor: "border-green-500/50",
    icon: CheckCircle,
  },
  delivered: {
    label: "Đã giao hàng",
    color: "text-green-500",
    bgColor: "bg-green-950/30",
    borderColor: "border-green-500/50",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Đã hủy",
    color: "text-red-400",
    bgColor: "bg-red-950/30",
    borderColor: "border-red-500/50",
    icon: XCircle,
  },
}

function TrackOrderForm() {
  const searchParams = useSearchParams()
  const orderIdFromUrl = searchParams.get("order_id")
  
  const [orderId, setOrderId] = useState(orderIdFromUrl || "")
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (orderIdFromUrl) {
      fetchOrder(orderIdFromUrl)
    }
  }, [orderIdFromUrl])

  const fetchOrder = async (id) => {
    if (!id || !id.trim()) {
      setError("Vui lòng nhập mã đơn hàng")
      return
    }

    setLoading(true)
    setError("")
    setOrder(null)

    try {
      const response = await fetch(`/api/orders?order_id=${encodeURIComponent(id.trim())}`)
      const data = await response.json()

      if (data.success && data.data && data.data.length > 0) {
        setOrder(data.data[0])
      } else {
        setError("Không tìm thấy đơn hàng với mã này")
      }
    } catch (err) {
      console.error("Error fetching order:", err)
      setError("Lỗi khi tìm kiếm đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchOrder(orderId)
  }

  const StatusIcon = order ? statusConfig[order.status]?.icon || Clock : Clock

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Package className="w-8 h-8 text-primary" />
            Theo dõi đơn hàng
          </h1>
          <p className="text-muted-foreground">Nhập mã đơn hàng để xem trạng thái đơn hàng của bạn</p>
        </div>

        {/* Search Form */}
        <div className="bg-card rounded-xl p-6 mb-6 border border-border">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Nhập mã đơn hàng (ví dụ: ORD-1234567890-123)"
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang tìm...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Tìm kiếm</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Status Card */}
            <div className={`bg-card rounded-xl p-6 border ${statusConfig[order.status]?.borderColor || "border-border"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${statusConfig[order.status]?.bgColor || "bg-muted"}`}>
                    <StatusIcon className={`w-6 h-6 ${statusConfig[order.status]?.color || "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground">Trạng thái đơn hàng</h2>
                    <p className={`text-sm font-medium ${statusConfig[order.status]?.color || "text-muted-foreground"}`}>
                      {statusConfig[order.status]?.label || order.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Mã đơn hàng</p>
                  <p className="text-sm font-mono font-semibold text-card-foreground">{order.order_id}</p>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Thông tin đơn hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tên khách hàng</p>
                  <p className="text-card-foreground font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Số điện thoại</p>
                  <p className="text-card-foreground font-medium">{order.customer_phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Địa chỉ giao hàng</p>
                  <p className="text-card-foreground font-medium">{order.customer_address || "Tại quán"}</p>
                </div>
                {order.notes && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                    <p className="text-card-foreground">{order.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ngày đặt hàng</p>
                  <p className="text-card-foreground font-medium">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tổng tiền</p>
                  <p className="text-primary font-bold text-lg">{formatCurrency(order.total_price || 0)}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Chi tiết đơn hàng</h3>
              <div className="space-y-3">
                {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-card-foreground font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-primary font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Không có món nào trong đơn hàng</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="animate-pulse">
              <div className="h-8 w-64 bg-muted rounded mx-auto mb-2"></div>
              <div className="h-4 w-96 bg-muted rounded mx-auto"></div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="animate-pulse">
              <div className="h-12 bg-muted rounded mb-4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <TrackOrderForm />
    </Suspense>
  )
}
