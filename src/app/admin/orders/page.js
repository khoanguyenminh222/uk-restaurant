'use client';

import { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '@/utils/helpers';
import Toast from '@/components/Toast/Toast';
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
  Mail,
  Calendar,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Truck,
  CheckCircle,
  User,
  UserX,
  ArrowRight,
  History,
  Plus,
  Minus
} from 'lucide-react';
import { adminFetch } from '@/lib/adminAuth';

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

// Thứ tự trạng thái (ngoại trừ cancelled)
const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed'];

// Lấy trạng thái tiếp theo
const getNextStatus = (currentStatus) => {
  if (currentStatus === 'cancelled') return null;
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[currentIndex + 1];
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [editingStatus, setEditingStatus] = useState('');
  const [editingAdminNotes, setEditingAdminNotes] = useState('');
  const [editingCustomerName, setEditingCustomerName] = useState('');
  const [editingCustomerPhone, setEditingCustomerPhone] = useState('');
  const [editingCustomerAddress, setEditingCustomerAddress] = useState('');
  const [editingTotalPrice, setEditingTotalPrice] = useState(0);
  const [editingItems, setEditingItems] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [pendingCancelOrderId, setPendingCancelOrderId] = useState(null);
  const [pendingCancelStatus, setPendingCancelStatus] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);

  // Refs for modals
  const detailModalRef = useRef(null);
  const editModalRef = useRef(null);
  const confirmModalRef = useRef(null);
  const cancelReasonModalRef = useRef(null);
  const historyModalRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, customerTypeFilter, dateFrom, dateTo, pagination.page]);

  // Listen for toast events
  useEffect(() => {
    const handleShowToast = (event) => {
      setToast({
        message: event.detail.message,
        isVisible: true,
        type: event.detail.type || 'success',
      });
    };

    window.addEventListener('showToast', handleShowToast);
    return () => window.removeEventListener('showToast', handleShowToast);
  }, []);


  // Handle click outside to close modals
  useEffect(() => {
    function handleClickOutside(event) {
      // Don't close if an operation is active
      if (isSaving || isConfirmingAction || updatingOrderId || deletingOrderId) return;

      if (showDetailModal && detailModalRef.current && !detailModalRef.current.contains(event.target)) {
        setShowDetailModal(false);
        setSelectedOrder(null);
      }
      if (showEditModal && editModalRef.current && !editModalRef.current.contains(event.target)) {
        setShowEditModal(false);
        setSelectedOrder(null);
      }
      if (showConfirmModal && confirmModalRef.current && !confirmModalRef.current.contains(event.target)) {
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmMessage('');
      }
      if (showCancelReasonModal && cancelReasonModalRef.current && !cancelReasonModalRef.current.contains(event.target)) {
        setShowCancelReasonModal(false);
        setPendingCancelOrderId(null);
        setPendingCancelStatus(null);
        setCancelReason('');
      }
      if (showHistoryModal && historyModalRef.current && !historyModalRef.current.contains(event.target)) {
        setShowHistoryModal(false);
      }
    }

    if (showDetailModal || showEditModal || showConfirmModal || showCancelReasonModal || showHistoryModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDetailModal, showEditModal, showConfirmModal, showCancelReasonModal, showHistoryModal, isSaving, isConfirmingAction, updatingOrderId, deletingOrderId]);

  // Handle scroll lock when modal is open
  useEffect(() => {
    if (showDetailModal || showEditModal || showConfirmModal || showCancelReasonModal || showHistoryModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDetailModal, showEditModal, showConfirmModal, showCancelReasonModal, showHistoryModal]);

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

      if (customerTypeFilter !== 'all') {
        params.append('customer_type', customerTypeFilter);
      }

      if (dateFrom) {
        params.append('date_from', dateFrom);
      }

      if (dateTo) {
        params.append('date_to', dateTo);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await adminFetch(`/api/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Lỗi khi tải danh sách đơn hàng', type: 'error' },
            })
          );
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi kết nối. Vui lòng thử lại sau.', type: 'error' },
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearching(true);
    try {
      await fetchOrders();
    } finally {
      setSearching(false);
    }
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    // Nếu là hủy đơn, hiển thị modal nhập lý do
    if (newStatus === 'cancelled') {
      setPendingCancelOrderId(orderId);
      setPendingCancelStatus(newStatus);
      setCancelReason('');
      setShowCancelReasonModal(true);
      return;
    }

    setConfirmMessage(`Bạn có chắc chắn muốn đổi status sang "${STATUS_CONFIG[newStatus]?.label}"?`);
    setConfirmAction(() => async () => {
      try {
        setUpdatingOrderId(orderId);
        setIsConfirmingAction(true);

        // Lấy thông tin admin từ localStorage
        const adminData = localStorage.getItem('admin_data');
        let adminPhone = null;
        if (adminData) {
          try {
            const admin = JSON.parse(adminData);
            adminPhone = admin.phone;
          } catch (e) {
            console.error('Error parsing admin data:', e);
          }
        }

        const headers = {
          'Content-Type': 'application/json',
        };

        // Gửi admin phone trong header
        if (adminPhone) {
          headers['x-admin-phone'] = adminPhone;
        }

        const response = await adminFetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            status: newStatus,
            changed_by: 'admin',
            currentAdminPhone: adminPhone, // Gửi trong body để backup
          }),
        });

        const data = await response.json();

        if (data.success) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('showToast', {
                detail: { message: 'Đã cập nhật status thành công!', type: 'success' },
              })
            );
          }
          fetchOrders();
        } else {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('showToast', {
                detail: { message: data.error || 'Không thể cập nhật status', type: 'error' },
              })
            );
          }
        }
      } catch (err) {
        console.error('Error updating order:', err);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Lỗi khi cập nhật đơn hàng', type: 'error' },
            })
          );
        }
      } finally {
        setUpdatingOrderId(null);
        setIsConfirmingAction(false);
      }
    });
    setShowConfirmModal(true);
  };


  const handleQuickUpdateStatus = (order) => {
    const nextStatus = getNextStatus(order.status);
    if (nextStatus) {
      handleUpdateStatus(order.order_id, nextStatus);
    }
  };

  const handleConfirmCancel = async () => {
    if (!pendingCancelOrderId || !pendingCancelStatus) return;

    setShowCancelReasonModal(false);
    setConfirmMessage(`Bạn có chắc chắn muốn hủy đơn hàng này?`);
    setConfirmAction(() => async () => {
      try {
        setUpdatingOrderId(pendingCancelOrderId);
        setIsConfirmingAction(true);

        // Lấy thông tin admin từ localStorage
        const adminData = localStorage.getItem('admin_data');
        let adminPhone = null;
        if (adminData) {
          try {
            const admin = JSON.parse(adminData);
            adminPhone = admin.phone;
          } catch (e) {
            console.error('Error parsing admin data:', e);
          }
        }

        const headers = {
          'Content-Type': 'application/json',
        };

        // Gửi admin phone trong header
        if (adminPhone) {
          headers['x-admin-phone'] = adminPhone;
        }

        const response = await adminFetch(`/api/orders/${pendingCancelOrderId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            status: pendingCancelStatus,
            changed_by: 'admin',
            currentAdminPhone: adminPhone,
            cancel_reason: cancelReason.trim() || '',
          }),
        });

        const data = await response.json();

        if (data.success) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('showToast', {
                detail: { message: 'Đã hủy đơn hàng thành công!', type: 'success' },
              })
            );
          }
          fetchOrders();
        } else {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('showToast', {
                detail: { message: data.error || 'Không thể hủy đơn hàng', type: 'error' },
              })
            );
          }
        }
      } catch (err) {
        console.error('Error cancelling order:', err);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Lỗi khi hủy đơn hàng', type: 'error' },
            })
          );
        }
      } finally {
        setUpdatingOrderId(null);
        setIsConfirmingAction(false);
        setPendingCancelOrderId(null);
        setPendingCancelStatus(null);
        setCancelReason('');
      }
    });
    setShowConfirmModal(true);
  };

  const handleDelete = (orderId) => {
    setConfirmMessage('Bạn có chắc chắn muốn xóa đơn hàng này?');
    setConfirmAction(() => async () => {
      try {
        setDeletingOrderId(orderId);
        setIsConfirmingAction(true);

        const response = await adminFetch(`/api/orders/${orderId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('showToast', {
                detail: { message: 'Đã xóa đơn hàng thành công!', type: 'success' },
              })
            );
          }
          fetchOrders();
        } else {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('showToast', {
                detail: { message: data.error || 'Không thể xóa đơn hàng', type: 'error' },
              })
            );
          }
        }
      } catch (err) {
        console.error('Error deleting order:', err);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Lỗi khi xóa đơn hàng', type: 'error' },
            })
          );
        }
      } finally {
        setDeletingOrderId(null);
        setIsConfirmingAction(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (confirmAction && !isConfirmingAction) {
      await confirmAction();
      setShowConfirmModal(false);
      setConfirmAction(null);
      setConfirmMessage('');
    }
  };

  const [viewingDetailId, setViewingDetailId] = useState(null);

  const handleViewDetail = async (orderId) => {
    try {
      setViewingDetailId(orderId);
      const response = await adminFetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedOrder(data.data);
        setShowDetailModal(true);
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Không thể lấy chi tiết đơn hàng', type: 'error' },
            })
          );
        }
      }
    } catch (err) {
      console.error('Error fetching order detail:', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi lấy chi tiết đơn hàng', type: 'error' },
          })
        );
      }
    } finally {
      setViewingDetailId(null);
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setEditingStatus(order.status);
    setEditingAdminNotes(order.admin_notes || '');
    setEditingCustomerName(order.customer_name || '');
    setEditingCustomerPhone(order.customer_phone || '');
    setEditingCustomerAddress(order.customer_address || '');
    setEditingTotalPrice(order.total_price || 0);
    // Copy items array để có thể chỉnh sửa
    if (order.items && Array.isArray(order.items)) {
      setEditingItems([...order.items]);
    } else {
      setEditingItems([]);
    }
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
      return order.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
    }
    return 'N/A';
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
            disabled={loading}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tải...</span>
              </>
            ) : (
              'Làm mới'
            )}
          </button>
        </div>
      </div>

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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {searching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tìm...</span>
              </>
            ) : (
              'Tìm kiếm'
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Date From */}
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Từ ngày"
            />
          </div>

          {/* Date To */}
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Đến ngày"
            />
          </div>

          {/* Clear Date Filter Button */}
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              Xóa lọc ngày
            </button>
          )}

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

          {/* Customer Type Filter */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={customerTypeFilter}
              onChange={(e) => {
                setCustomerTypeFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="pl-10 pr-8 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="all">Tất cả KH</option>
              <option value="logged_in">Đã đăng nhập</option>
              <option value="guest">Vãng lai</option>
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
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Loại KH
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-muted-foreground">
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
                          {order.status !== 'cancelled' && getNextStatus(order.status) && (
                            <button
                              onClick={() => handleQuickUpdateStatus(order)}
                              disabled={updatingOrderId === order.order_id}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title={`Chuyển sang ${STATUS_CONFIG[getNextStatus(order.status)]?.label}`}
                              aria-label="Cập nhật trạng thái"
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
                            aria-label="Xem chi tiết"
                          >
                            {viewingDetailId === order.order_id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(order)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                            aria-label="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.order_id)}
                            disabled={deletingOrderId === order.order_id}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Xóa"
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
              <div
                key={order.order_id}
                className="bg-card rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-sm font-semibold text-card-foreground">{order.order_id}</span>
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border shrink-0 ${STATUS_CONFIG[order.status]?.color || 'bg-gray-500/20 text-gray-600 border-gray-500/50'}`}>
                          <StatusIcon className="w-3 h-3" />
                          {STATUS_CONFIG[order.status]?.label || order.status}
                        </span>
                        {order.status !== 'cancelled' && getNextStatus(order.status) && (
                          <button
                            onClick={() => handleQuickUpdateStatus(order)}
                            disabled={updatingOrderId === order.order_id}
                            className="p-1 text-primary hover:bg-primary/10 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title={`Chuyển sang ${STATUS_CONFIG[getNextStatus(order.status)]?.label}`}
                            aria-label="Cập nhật trạng thái"
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
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDelete(order.order_id)}
                    disabled={deletingOrderId === order.order_id}
                    className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-card border border-border rounded-lg text-card-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 bg-card border border-border rounded-lg text-card-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Sau
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={detailModalRef}
            className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border border-border animate-in fade-in zoom-in duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 relative">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-primary" />
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
                      setShowDetailModal(false);
                      setSelectedOrder(null);
                    }}
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
                    <p className="font-medium text-card-foreground">{selectedOrder.order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ngày đặt</p>
                    <p className="font-medium text-card-foreground">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
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
                            <p className="font-medium text-card-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">x{item.quantity} - {formatCurrency(item.price)}</p>
                          </div>
                          <p className="font-medium text-primary">{formatCurrency(item.price * item.quantity)}</p>
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
                {(selectedOrder.notes || selectedOrder.admin_notes || selectedOrder.cancel_reason) && (
                  <div className="border-t border-border pt-4">
                    <h3 className="font-semibold text-card-foreground mb-3">Ghi chú</h3>
                    <div className="space-y-3">
                      {selectedOrder.notes && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Từ khách hàng:</p>
                          <p className="text-sm text-card-foreground">{selectedOrder.notes}</p>
                        </div>
                      )}
                      {selectedOrder.admin_notes && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Ghi chú từ admin:</p>
                          <p className="text-sm text-card-foreground">{selectedOrder.admin_notes}</p>
                        </div>
                      )}
                      {selectedOrder.cancel_reason && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Lý do hủy đơn hàng:</p>
                          <p className="text-sm text-destructive">{selectedOrder.cancel_reason}</p>
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

      {/* Edit Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={editModalRef}
            className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-border relative shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <button
              onClick={() => {
                if (!isSaving) {
                  setShowEditModal(false);
                  setSelectedOrder(null);
                  setEditingStatus('');
                  setEditingAdminNotes('');
                  setEditingCustomerName('');
                  setEditingCustomerPhone('');
                  setEditingCustomerAddress('');
                  setEditingTotalPrice(0);
                  setEditingItems([]);
                }
              }}
              disabled={isSaving}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <Edit2 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-card-foreground">Cập nhật đơn hàng</h2>
            </div>

            <div className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Tên khách hàng <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingCustomerName}
                    onChange={(e) => setEditingCustomerName(e.target.value)}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Số điện thoại <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingCustomerPhone}
                    onChange={(e) => setEditingCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={editingCustomerAddress}
                  onChange={(e) => setEditingCustomerAddress(e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Items */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Danh sách món
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-border rounded-lg p-3 bg-muted/30">
                  {editingItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Chưa có món nào</p>
                  ) : (
                    editingItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-card rounded border border-border">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-card-foreground">{item.name || 'N/A'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity || 1}
                              onChange={(e) => {
                                const newItems = [...editingItems];
                                newItems[index].quantity = parseInt(e.target.value) || 1;
                                setEditingItems(newItems);
                                // Auto calculate total
                                const total = newItems.reduce((sum, i) => sum + (i.giá || 0) * (i.quantity || 1), 0);
                                setEditingTotalPrice(total);
                              }}
                              className="w-16 px-2 py-1 bg-input border border-border rounded text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <span className="text-xs text-muted-foreground">x</span>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={item.price || 0}
                              onChange={(e) => {
                                const newItems = [...editingItems];
                                newItems[index].giá = parseInt(e.target.value) || 0;
                                setEditingItems(newItems);
                                // Auto calculate total
                                const total = newItems.reduce((sum, i) => sum + (i.giá || 0) * (i.quantity || 1), 0);
                                setEditingTotalPrice(total);
                              }}
                              className="w-24 px-2 py-1 bg-input border border-border rounded text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <span className="text-xs text-muted-foreground">=</span>
                            <span className="text-sm font-medium text-primary">
                              {formatCurrency((item.price || 0) * (item.quantity || 1))}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newItems = editingItems.filter((_, i) => i !== index);
                            setEditingItems(newItems);
                            // Auto calculate total
                            const total = newItems.reduce((sum, i) => sum + (i.giá || 0) * (i.quantity || 1), 0);
                            setEditingTotalPrice(total);
                          }}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer"
                          aria-label="Xóa món"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Total Price */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Tổng tiền <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={editingTotalPrice}
                  onChange={(e) => setEditingTotalPrice(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tự động tính: {formatCurrency(editingItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0))}
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Trạng thái
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

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Ghi chú từ admin
                </label>
                <textarea
                  value={editingAdminNotes}
                  onChange={(e) => setEditingAdminNotes(e.target.value)}
                  placeholder="Nhập ghi chú từ admin..."
                  rows={3}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {editingAdminNotes.length}/500 ký tự
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={async () => {
                    // Lấy thông tin admin từ localStorage
                    const adminData = localStorage.getItem('admin_data');
                    let adminPhone = null;
                    if (adminData) {
                      try {
                        const admin = JSON.parse(adminData);
                        adminPhone = admin.phone;
                      } catch (e) {
                        console.error('Error parsing admin data:', e);
                      }
                    }

                    const headers = {
                      'Content-Type': 'application/json',
                    };

                    if (adminPhone) {
                      headers['x-admin-phone'] = adminPhone;
                    }

                    // Validate
                    if (!editingCustomerName.trim()) {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                          new CustomEvent('showToast', {
                            detail: { message: 'Tên khách hàng là bắt buộc', type: 'error' },
                          })
                        );
                      }
                      return;
                    }
                    if (!editingCustomerPhone.trim()) {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                          new CustomEvent('showToast', {
                            detail: { message: 'Số điện thoại là bắt buộc', type: 'error' },
                          })
                        );
                      }
                      return;
                    }
                    if (editingItems.length === 0) {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                          new CustomEvent('showToast', {
                            detail: { message: 'Đơn hàng phải có ít nhất 1 món', type: 'error' },
                          })
                        );
                      }
                      return;
                    }
                    if (editingTotalPrice <= 0) {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                          new CustomEvent('showToast', {
                            detail: { message: 'Tổng tiền phải > 0', type: 'error' },
                          })
                        );
                      }
                      return;
                    }

                    setIsSaving(true);
                    try {
                      const response = await adminFetch(`/api/orders/${selectedOrder.order_id}`, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify({
                          status: editingStatus,
                          admin_notes: editingAdminNotes.trim() || '',
                          customer_name: editingCustomerName.trim(),
                          customer_phone: editingCustomerPhone.trim(),
                          customer_address: editingCustomerAddress.trim() || '',
                          items: editingItems,
                          total_price: editingTotalPrice,
                          changed_by: 'admin',
                          currentAdminPhone: adminPhone,
                        }),
                      });

                      const data = await response.json();

                      if (data.success) {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(
                            new CustomEvent('showToast', {
                              detail: { message: 'Đã cập nhật đơn hàng thành công!', type: 'success' },
                            })
                          );
                        }
                        setShowEditModal(false);
                        setSelectedOrder(null);
                        setEditingStatus('');
                        setEditingAdminNotes('');
                        setEditingCustomerName('');
                        setEditingCustomerPhone('');
                        setEditingCustomerAddress('');
                        setEditingTotalPrice(0);
                        setEditingItems([]);
                        fetchOrders();
                      } else {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(
                            new CustomEvent('showToast', {
                              detail: { message: data.error || 'Không thể cập nhật đơn hàng', type: 'error' },
                            })
                          );
                        }
                      }
                    } catch (err) {
                      console.error('Error updating order:', err);
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                          new CustomEvent('showToast', {
                            detail: { message: 'Lỗi khi cập nhật đơn hàng', type: 'error' },
                          })
                        );
                      }
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    'Cập nhật'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedOrder(null);
                    setEditingStatus('');
                    setEditingAdminNotes('');
                    setEditingCustomerName('');
                    setEditingCustomerPhone('');
                    setEditingCustomerAddress('');
                    setEditingTotalPrice(0);
                    setEditingItems([]);
                  }}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={confirmModalRef}
            className="bg-card rounded-xl max-w-md w-full p-6 border border-border shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <h2 className="text-xl font-bold text-card-foreground mb-4">Xác nhận</h2>
            <p className="text-card-foreground mb-6">{confirmMessage}</p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmAction}
                disabled={isConfirmingAction}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConfirmingAction ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  'Xác nhận'
                )}
              </button>
              <button
                onClick={() => {
                  if (!isConfirmingAction) {
                    setShowConfirmModal(false);
                    setConfirmAction(null);
                    setConfirmMessage('');
                  }
                }}
                disabled={isConfirmingAction}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {showCancelReasonModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={cancelReasonModalRef}
            className="bg-card rounded-xl max-w-md w-full p-6 border border-border shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <h2 className="text-xl font-bold text-card-foreground mb-4">Hủy đơn hàng</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Vui lòng nhập lý do hủy đơn hàng (tùy chọn):
            </p>

            <div className="mb-4">
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy đơn hàng..."
                rows={4}
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
                  if (!isConfirmingAction && updatingOrderId !== pendingCancelOrderId) {
                    setShowCancelReasonModal(false);
                    setPendingCancelOrderId(null);
                    setPendingCancelStatus(null);
                    setCancelReason('');
                  }
                }}
                disabled={isConfirmingAction || updatingOrderId === pendingCancelOrderId}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isConfirmingAction || updatingOrderId === pendingCancelOrderId}
                className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConfirmingAction || updatingOrderId === pendingCancelOrderId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  'Xác nhận hủy'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status History Modal */}
      {showHistoryModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={historyModalRef}
            className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-border shadow-2xl animate-in fade-in zoom-in duration-200"
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
                <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                <p className="font-medium text-card-foreground">{selectedOrder.order_id}</p>
              </div>

              {/* Change History */}
              {selectedOrder.change_history && selectedOrder.change_history.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-card-foreground">Lịch sử chỉnh sửa</h3>
                  {selectedOrder.change_history.map((changeEntry, index) => {
                    const isLast = index === selectedOrder.change_history.length - 1;
                    return (
                      <div key={index} className="relative border-l-2 border-border pl-4 pb-4">
                        <div className="flex items-start gap-3">
                          <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${isLast
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
                                {changeEntry.changed_by_detail ? (
                                  <>
                                    {changeEntry.changed_by_detail.name || changeEntry.changed_by_detail.phone || changeEntry.changed_by || 'N/A'}
                                    {changeEntry.changed_by_detail.role && (
                                      <span className="ml-1">
                                        ({changeEntry.changed_by_detail.role === 'super_admin' ? 'Super Admin' : changeEntry.changed_by_detail.role === 'manager' ? 'Manager' : 'Admin'})
                                      </span>
                                    )}
                                  </>
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
                                      items: 'Danh sách món',
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
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${STATUS_CONFIG[value]?.color || 'bg-gray-500/20 text-gray-600 border-gray-500/50'
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
                                          return `${items.length} món: ${items.map(i => `${i.tên_món} (x${i.quantity})`).join(', ')}`;
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
                      return (
                        <div key={index} className="relative border-l-2 border-border pl-4 pb-4">
                          <div className="flex items-start gap-3">
                            <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${isLast
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'bg-muted border-border text-muted-foreground'
                              }`}>
                              <StatusIcon className="w-3 h-3" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${STATUS_CONFIG[history.status]?.color || 'bg-gray-500/20 text-gray-600 border-gray-500/50'
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
                                  {history.changed_by_detail ? (
                                    <>
                                      {history.changed_by_detail.name || history.changed_by_detail.phone || history.changed_by || 'N/A'}
                                      {history.changed_by_detail.role && (
                                        <span className="text-xs ml-1 text-muted-foreground">
                                          ({history.changed_by_detail.role === 'super_admin' ? 'Super Admin' : history.changed_by_detail.role === 'manager' ? 'Manager' : 'Admin'})
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    history.changed_by || 'N/A'
                                  )}
                                </span>
                              </p>
                              {history.changed_by_detail && history.changed_by_detail.email && (
                                <p className="text-xs text-muted-foreground">
                                  Email: {history.changed_by_detail.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ message: '', isVisible: false })}
        type={toast.type || 'success'}
      />
    </div>
  );
}

