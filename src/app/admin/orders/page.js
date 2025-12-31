'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/helpers';
import { 
  ShoppingCart, 
  Loader2, 
  Search, 
  Filter, 
  X, 
  Eye, 
  Edit2, 
  Trash2, 
  Phone, 
  Calendar,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Truck,
  CheckCircle
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-500/20 text-blue-600 border-blue-500/50', icon: CheckCircle2 },
  preparing: { label: 'Đang chuẩn bị', color: 'bg-orange-500/20 text-orange-600 border-orange-500/50', icon: Package },
  ready: { label: 'Sẵn sàng', color: 'bg-green-500/20 text-green-600 border-green-500/50', icon: CheckCircle },
  delivered: { label: 'Đã giao', color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/50', icon: Truck },
  completed: { label: 'Hoàn thành', color: 'bg-green-600/20 text-green-700 border-green-600/50', icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy', color: 'bg-red-500/20 text-red-600 border-red-500/50', icon: XCircle },
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'preparing', label: 'Đang chuẩn bị' },
  { value: 'ready', label: 'Sẵn sàng' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      } else {
        setError(data.error || 'Lỗi khi tải danh sách đơn hàng');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!confirm(`Bạn có chắc chắn muốn đổi status sang "${STATUS_CONFIG[newStatus]?.label}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          changed_by: 'admin',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Đã cập nhật status thành công!`);
        fetchOrders();
        setShowEditModal(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Không thể cập nhật status');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Lỗi khi cập nhật đơn hàng');
    }
  };


  const handleDelete = async (orderId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Đã xóa đơn hàng thành công!');
        fetchOrders();
      } else {
        setError(data.error || 'Không thể xóa đơn hàng');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Lỗi khi xóa đơn hàng');
    }
  };

  const handleViewDetail = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedOrder(data.data);
        setShowDetailModal(true);
      } else {
        setError(data.error || 'Không thể lấy chi tiết đơn hàng');
      }
    } catch (err) {
      console.error('Error fetching order detail:', err);
      setError('Lỗi khi lấy chi tiết đơn hàng');
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setEditingStatus(order.status);
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getItemCount = (order) => {
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
    return order.quantity || 1;
  };

  const getItemNames = (order) => {
    if (order.items && Array.isArray(order.items)) {
      return order.items.map(item => `${item.tên_món} (x${item.quantity})`).join(', ');
    }
    return `${order.tên_món || 'N/A'} (x${order.quantity || 1})`;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-muted-foreground">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-7 h-7 text-primary" />
          <h1 className="text-2xl lg:text-3xl font-bold text-card-foreground">Quản lý Đơn hàng</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium text-sm"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-success/10 border border-success/50 rounded-lg text-success text-sm">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm theo Order ID, tên KH, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium"
          >
            Tìm kiếm
          </button>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="pl-10 pr-8 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Món ăn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                        {formatCurrency(order.total_price || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${STATUS_CONFIG[order.status]?.color || 'bg-gray-500/20 text-gray-600 border-gray-500/50'}`}>
                          <StatusIcon className="w-3 h-3" />
                          {STATUS_CONFIG[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(order.order_id)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            aria-label="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(order)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            aria-label="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.order_id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            aria-label="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
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
              <div
                key={order.order_id}
                className="bg-card rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-card-foreground">{order.order_id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border shrink-0 ${STATUS_CONFIG[order.status]?.color || 'bg-gray-500/20 text-gray-600 border-gray-500/50'}`}>
                        <StatusIcon className="w-3 h-3" />
                        {STATUS_CONFIG[order.status]?.label || order.status}
                      </span>
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
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Chi tiết</span>
                  </button>
                  <button
                    onClick={() => handleEdit(order)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDelete(order.order_id)}
                    className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-card border border-border rounded-lg text-card-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 bg-card border border-border rounded-lg text-card-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setShowDetailModal(false);
                setSelectedOrder(null);
              }}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-card-foreground">Chi tiết đơn hàng</h2>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                    <p className="font-medium text-card-foreground">{selectedOrder.order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ngày đặt</p>
                    <p className="font-medium text-card-foreground">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    {(() => {
                      const StatusIcon = STATUS_CONFIG[selectedOrder.status]?.icon || Clock;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${STATUS_CONFIG[selectedOrder.status]?.color || 'bg-gray-500/20 text-gray-600 border-gray-500/50'}`}>
                          <StatusIcon className="w-3 h-3" />
                          {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                        </span>
                      );
                    })()}
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
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Địa chỉ</p>
                      <p className="font-medium text-card-foreground">{selectedOrder.customer_address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold text-card-foreground mb-3">Danh sách món</h3>
                  {selectedOrder.items && Array.isArray(selectedOrder.items) ? (
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
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Từ khách hàng:</p>
                      <p className="text-sm text-card-foreground">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6 border border-border relative">
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedOrder(null);
                setEditingStatus('');
              }}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <Edit2 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-card-foreground">Cập nhật đơn hàng</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Status
                </label>
                <select
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {STATUS_OPTIONS.filter(opt => opt.value !== 'all').map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedOrder.order_id, editingStatus);
                  }}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium"
                >
                  Cập nhật
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedOrder(null);
                    setEditingStatus('');
                  }}
                  className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

