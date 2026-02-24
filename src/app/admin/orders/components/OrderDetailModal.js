import { ShoppingCart, History, X, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function OrderDetailModal({
    isOpen,
    onClose,
    order,
    STATUS_CONFIG,
    setShowHistoryModal,
    modalRef
}) {
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div
                ref={modalRef}
                className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border border-border animate-in fade-in zoom-in duration-200"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6 relative">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold text-card-foreground">Chi tiết đơn hàng</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {order.status_history && order.status_history.length > 0 && (
                                <button
                                    onClick={() => setShowHistoryModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium cursor-pointer"
                                >
                                    <History className="w-4 h-4" />
                                    <span>Lịch sử thay đổi</span>
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer z-20"
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
                                <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                                <p className="font-medium text-card-foreground">{order.order_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Ngày đặt</p>
                                <p className="font-medium text-card-foreground">{formatDate(order.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
                                {(() => {
                                    const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock;
                                    return (
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${STATUS_CONFIG[order.status]?.color || 'bg-gray-500/20 text-gray-600 border-gray-500/50'}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {STATUS_CONFIG[order.status]?.label || order.status}
                                        </span>
                                    );
                                })()}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Tổng tiền</p>
                                <p className="font-bold text-lg text-primary">{formatCurrency(order.total_price || 0)}</p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="border-t border-border pt-4">
                            <h3 className="font-semibold text-card-foreground mb-3">Thông tin khách hàng</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Tên</p>
                                    <p className="font-medium text-card-foreground">{order.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Số điện thoại</p>
                                    <a href={`tel:${order.customer_phone}`} className="font-medium text-primary hover:underline">
                                        {order.customer_phone}
                                    </a>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                                    {order.customer_email ? (
                                        <a href={`mailto:${order.customer_email}`} className="font-medium text-primary hover:underline">
                                            {order.customer_email}
                                        </a>
                                    ) : (
                                        <p className="font-medium text-card-foreground">N/A</p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground mb-1">Địa chỉ</p>
                                    <p className="font-medium text-card-foreground">{order.customer_address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="border-t border-border pt-4">
                            <h3 className="font-semibold text-card-foreground mb-3">Danh sách món</h3>
                            {order.items && Array.isArray(order.items) ? (
                                <div className="space-y-2">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div>
                                                <p className="font-medium text-card-foreground">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">x{item.quantity} - {formatCurrency(item.price)}</p>
                                            </div>
                                            <p className="font-medium text-primary">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="font-medium text-card-foreground">{order.tên_món || 'N/A'}</p>
                                    <p className="text-sm text-muted-foreground">x{order.quantity || 1} - {formatCurrency(order.giá || 0)}</p>
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        {(order.notes || order.admin_notes || order.cancel_reason) && (
                            <div className="border-t border-border pt-4">
                                <h3 className="font-semibold text-card-foreground mb-3">Ghi chú</h3>
                                <div className="space-y-3">
                                    {order.notes && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Từ khách hàng:</p>
                                            <p className="text-sm text-card-foreground">{order.notes}</p>
                                        </div>
                                    )}
                                    {order.admin_notes && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Ghi chú từ admin:</p>
                                            <p className="text-sm text-card-foreground">{order.admin_notes}</p>
                                        </div>
                                    )}
                                    {order.cancel_reason && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Lý do hủy đơn hàng:</p>
                                            <p className="text-sm text-destructive">{order.cancel_reason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
