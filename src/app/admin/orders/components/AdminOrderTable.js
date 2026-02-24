import { ShoppingCart, Eye, Edit2, Trash2, Phone, Mail, Calendar, Loader2, ArrowRight, User, UserX, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function AdminOrderTable({
    orders,
    loading,
    searchTerm,
    statusFilter,
    STATUS_CONFIG,
    getNextStatus,
    handleQuickUpdateStatus,
    updatingOrderId,
    handleViewDetail,
    viewingDetailId,
    handleEdit,
    handleDelete,
    deletingOrderId,
    getItemNames,
    getItemCount,
    adminRole
}) {
    const isSuperAdmin = adminRole === 'super_admin';
    const isTerminalStatus = (status) => ['cancelled', 'completed', 'deleted'].includes(status);
    const cannotEdit = (status) => isTerminalStatus(status) && !isSuperAdmin;
    const cannotDelete = (status) => isTerminalStatus(status) && !isSuperAdmin;

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-card rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ngày đặt</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Món ăn</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tổng tiền</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Loại KH</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center text-muted-foreground">
                                        {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock;
                                    return (
                                        <tr key={order.order_id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-card-foreground">{order.order_id}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs">
                                                <div className="truncate" title={getItemNames(order)}>
                                                    {getItemNames(order)}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {getItemCount(order)} món
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-card-foreground">{order.customer_name}</div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    <a href={`tel:${order.customer_phone}`} className="hover:text-primary">
                                                        {order.customer_phone}
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                {order.customer_email ? (
                                                    <a href={`mailto:${order.customer_email}`} className="hover:text-primary">
                                                        {order.customer_email}
                                                    </a>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                                                {formatCurrency(order.total_price || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${STATUS_CONFIG[order.status]?.color || 'bg-gray-500/20 text-gray-600 border-gray-500/50'}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {STATUS_CONFIG[order.status]?.label || order.status}
                                                    </span>
                                                    {order.status !== 'cancelled' && order.status !== 'deleted' && getNextStatus(order.status) && (
                                                        <button
                                                            onClick={() => handleQuickUpdateStatus(order)}
                                                            disabled={updatingOrderId === order.order_id}
                                                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title={`Chuyển sang ${STATUS_CONFIG[getNextStatus(order.status)]?.label}`}
                                                        >
                                                            {updatingOrderId === order.order_id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <ArrowRight className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {order.user_id ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-600 border border-blue-500/50">
                                                        <User className="w-3 h-3" />
                                                        Đăng nhập
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-600 border border-gray-500/50">
                                                        <UserX className="w-3 h-3" />
                                                        Vãng lai
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewDetail(order.order_id)}
                                                        disabled={viewingDetailId === order.order_id}
                                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {viewingDetailId === order.order_id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(order)}
                                                        disabled={cannotEdit(order.status)}
                                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title={cannotEdit(order.status) ? "Chỉ Super Admin mới có quyền sửa đơn hàng đã đóng" : "Sửa đơn hàng"}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(order.order_id)}
                                                        disabled={deletingOrderId === order.order_id || cannotDelete(order.status)}
                                                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title={cannotDelete(order.status) ? "Chỉ Super Admin mới có quyền xóa đơn hàng đã đóng" : "Xóa đơn hàng"}
                                                    >
                                                        {deletingOrderId === order.order_id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {orders.length === 0 ? (
                    <div className="bg-card rounded-lg border border-border p-8 text-center">
                        <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
                        </p>
                    </div>
                ) : (
                    orders.map((order) => {
                        const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock;
                        return (
                            <div key={order.order_id} className="bg-card rounded-lg border border-border p-4 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="text-sm font-semibold text-card-foreground">{order.order_id}</span>
                                            <div className="flex items-center gap-1">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border shrink-0 ${STATUS_CONFIG[order.status]?.color || 'bg-gray-500/20 text-gray-600 border-gray-500/50'}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {STATUS_CONFIG[order.status]?.label || order.status}
                                                </span>
                                                {order.status !== 'cancelled' && order.status !== 'deleted' && getNextStatus(order.status) && (
                                                    <button
                                                        onClick={() => handleQuickUpdateStatus(order)}
                                                        disabled={updatingOrderId === order.order_id}
                                                        className="p-1 text-primary hover:bg-primary/10 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {updatingOrderId === order.order_id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <ArrowRight className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                            {order.user_id ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-600 border border-blue-500/50 shrink-0">
                                                    <User className="w-3 h-3" />
                                                    Đã đăng nhập
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-600 border border-gray-500/50 shrink-0">
                                                    <UserX className="w-3 h-3" />
                                                    Khách vãng lai
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(order.created_at)}
                                        </p>
                                        <div className="text-sm text-muted-foreground mb-2">
                                            <p className="font-medium text-card-foreground">{order.customer_name}</p>
                                            <p className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                <a href={`tel:${order.customer_phone}`} className="hover:text-primary">
                                                    {order.customer_phone}
                                                </a>
                                            </p>
                                            {order.customer_email && (
                                                <p className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    <a href={`mailto:${order.customer_email}`} className="hover:text-primary">
                                                        {order.customer_email}
                                                    </a>
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <p className="truncate">{getItemNames(order)}</p>
                                            <p className="text-xs mt-1">{getItemCount(order)} món</p>
                                        </div>
                                        <p className="text-lg font-bold text-primary mt-2">
                                            {formatCurrency(order.total_price || 0)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-border">
                                    <button
                                        onClick={() => handleViewDetail(order.order_id)}
                                        disabled={viewingDetailId === order.order_id}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {viewingDetailId === order.order_id ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Đang tải...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="w-4 h-4" />
                                                <span>Chi tiết</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(order)}
                                        disabled={cannotEdit(order.status)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={cannotEdit(order.status) ? "Chỉ Super Admin mới có quyền sửa đơn hàng đã đóng" : ""}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        <span>Sửa</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(order.order_id)}
                                        disabled={deletingOrderId === order.order_id || cannotDelete(order.status)}
                                        className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        title={cannotDelete(order.status) ? "Chỉ Super Admin mới có quyền xóa đơn hàng đã đóng" : ""}
                                    >
                                        {deletingOrderId === order.order_id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
}
