"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Package, Clock, CheckCircle, XCircle, Loader2, Phone, History, ArrowRight, User, MapPin, DollarSign, MessageSquare, Tag, CheckCircle2, Truck } from "lucide-react"
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

const fieldLabels = {
  customer_name: { label: 'Tên khách', icon: User },
  customer_phone: { label: 'SĐT', icon: Phone },
  customer_address: { label: 'Địa chỉ', icon: MapPin },
  total_price: { label: 'Tổng tiền', icon: DollarSign },
  status: { label: 'Trạng thái', icon: Tag },
  admin_notes: { label: 'Ghi chú', icon: MessageSquare },
  items: { label: 'Món ăn', icon: Package },
}

function TrackOrderForm() {
  const searchParams = useSearchParams()
  const orderIdFromUrl = searchParams.get("order_id")
  const phoneFromUrl = searchParams.get("phone")

  const [orderId, setOrderId] = useState(orderIdFromUrl || "")
  const [phone, setPhone] = useState(phoneFromUrl || "")
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (orderIdFromUrl) {
      // Nếu có both ID và Phone từ URL (từ trang Order Success), auto fetch
      if (phoneFromUrl) {
        fetchOrder(orderIdFromUrl, phoneFromUrl)
      }
      // Nếu chỉ có ID, user phải nhập phone -> không auto fetch ngay mà để user nhập
    }
  }, [orderIdFromUrl, phoneFromUrl])

  const fetchOrder = async (id, phoneNumber) => {
    if (!id || !id.trim()) {
      setError("Vui lòng nhập mã đơn hàng")
      return
    }
    if (!phoneNumber || !phoneNumber.trim()) {
      setError("Vui lòng nhập số điện thoại đặt hàng")
      return
    }

    setLoading(true)
    setError("")
    setOrder(null)

    try {
      const response = await fetch(`/api/orders?order_id=${encodeURIComponent(id.trim())}&phone=${encodeURIComponent(phoneNumber.trim())}`)
      const data = await response.json()

      if (data.success && data.data && data.data.length > 0) {
        setOrder(data.data[0])
      } else {
        if (response.status === 403) {
          setError("Thông tin không chính xác (Mã đơn hàng hoặc Số điện thoại)")
        } else {
          setError("Không tìm thấy đơn hàng với thông tin này")
        }
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
    fetchOrder(orderId, phone)
  }

  const StatusIcon = order ? statusConfig[order.status]?.icon || Clock : Clock

  // Helper for item differences
  const getItemDiff = (oldR, newR) => {
    try {
      const oldI = typeof oldR === 'string' ? JSON.parse(oldR) : (oldR || []);
      const newI = typeof newR === 'string' ? JSON.parse(newR) : (newR || []);
      const added = newI.filter(n => !oldI.find(o => o.food_id === n.food_id));
      const removed = oldI.filter(o => !newI.find(n => n.food_id === o.food_id));
      const changed = newI.filter(n => {
        const old = oldI.find(o => o.food_id === n.food_id);
        return old && (old.quantity !== n.quantity || old.price !== n.price);
      }).map(n => {
        const old = oldI.find(o => o.food_id === n.food_id);
        return { name: n.name, oldQ: old.quantity, newQ: n.quantity, oldP: old.price, newP: n.price };
      });
      return { added, removed, changed };
    } catch (e) { return null; }
  };

  // Process timeline data
  const getTimeline = () => {
    if (!order) return [];
    const timeline = [];

    // Detailed changes
    if (order.change_history) {
      order.change_history.forEach(item => {
        timeline.push({ ...item, timestamp: new Date(item.changed_at), type: 'detail' });
      });
    }

    // Status changes
    if (order.status_history) {
      order.status_history.forEach(item => {
        const timestamp = new Date(item.changed_at);
        // Avoid duplicate entries if detailed history already covers this timestamp
        const isCovered = order.change_history?.some(d =>
          Math.abs(new Date(d.changed_at).getTime() - timestamp.getTime()) < 1000
        );
        if (!isCovered) {
          timeline.push({ ...item, timestamp, type: 'status' });
        }
      });
    }

    // Sort by newest first
    return timeline.sort((a, b) => b.timestamp - a.timestamp);
  };

  const sortedTimeline = getTimeline();

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Package className="w-8 h-8 text-primary" />
            Theo dõi đơn hàng
          </h1>
          <p className="text-muted-foreground">Nhập mã đơn hàng và số điện thoại để xem trạng thái</p>
        </div>

        {/* Search Form */}
        <div className="bg-card rounded-xl p-6 mb-6 border border-border">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Mã đơn hàng (ví dụ: ORD-...)"
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex-1 relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại đặt hàng"
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
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

            {/* Order History Timeline */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-6">
                <History className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-card-foreground">Nhật ký đơn hàng</h3>
              </div>

              {sortedTimeline.length > 0 ? (
                <div className="relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                  {sortedTimeline.map((entry, idx) => {
                    const isAdmin = entry.changed_by === 'admin' || entry.changed_by === 'system';
                    const changerDisplay = entry.changed_by_detail?.name || (isAdmin ? "Hệ thống" : "Khách hàng");

                    const statusChange = entry.type === 'status' ? entry.status : entry.changes?.find(c => c.field === 'status')?.new_value;
                    const statusInfo = statusChange ? statusConfig[statusChange] : null;

                    return (
                      <div key={idx} className="relative pl-10 pb-8 last:pb-0">
                        {/* Point */}
                        <div className={`absolute left-0 top-1 w-9 h-9 rounded-full border-2 border-background flex items-center justify-center z-10 shadow-sm ${statusInfo ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {statusInfo ? (
                            (() => { const Icon = statusInfo.icon; return <Icon className="w-4 h-4" /> })()
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-current opacity-40" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-card-foreground">{changerDisplay}</span>
                              {entry.changed_by_detail?.type === 'admin' && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold">Admin</span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {entry.timestamp.toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric"
                              })}
                            </span>
                          </div>

                          <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                            {entry.type === 'detail' && entry.changes ? (
                              <div className="space-y-3">
                                {entry.changes.map((ch, cIdx) => {
                                  // Skip internal fields like admin_notes for privacy
                                  if (ch.field === 'admin_notes') return null;

                                  if (ch.field === 'items') {
                                    const diff = getItemDiff(ch.old_value, ch.new_value);
                                    return diff && (
                                      <div key={cIdx} className="space-y-1">
                                        <span className="text-xs font-bold text-muted-foreground block border-b border-border/50 pb-1 mb-1">Cập nhật món ăn:</span>
                                        {diff.added.map((it, i) => <div key={`a-${i}`} className="text-xs text-green-600 font-medium">+ Thêm: {it.name} (x{it.quantity})</div>)}
                                        {diff.removed.map((it, i) => <div key={`r-${i}`} className="text-xs text-red-500 font-medium">- Xóa: {it.name}</div>)}
                                        {diff.changed.map((it, i) => (
                                          <div key={`c-${i}`} className="text-xs text-blue-600 font-medium">
                                            ~ {it.name}: {it.oldQ !== it.newQ && `SL ${it.oldQ} → ${it.newQ}`}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  }

                                  const label = fieldLabels[ch.field]?.label || ch.field;
                                  return (
                                    <div key={cIdx} className="text-sm">
                                      <span className="text-xs font-bold text-muted-foreground">{label}:</span>
                                      <div className="flex items-center gap-2 mt-1 pl-2 border-l-2 border-primary/20">
                                        <span className="text-xs opacity-60">
                                          {ch.field === 'status' ? (statusConfig[ch.old_value]?.label || ch.old_value) : ch.old_value}
                                        </span>
                                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs font-medium text-primary">
                                          {ch.field === 'status' ? (statusConfig[ch.new_value]?.label || ch.new_value) : ch.new_value}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                                <span className={`text-sm font-bold ${statusInfo?.color || ''}`}>
                                  {statusInfo?.label || entry.status}
                                </span>
                              </div>
                            )}

                            {entry.cancel_reason && (
                              <div className="mt-2 pt-2 border-t border-border/50 text-xs italic text-red-500">
                                Lý do: &quot;{entry.cancel_reason}&quot;
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">Chưa có lịch sử xử lý cho đơn hàng này</p>
                </div>
              )}
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
