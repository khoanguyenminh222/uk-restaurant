'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShoppingCart, Loader2, Plus } from 'lucide-react';
import { adminFetch } from '@/lib/adminAuth';
import Toast from '@/components/Toast/Toast';

// Import refactored components
import OrderFilter from './components/OrderFilter';
import AdminOrderTable from './components/AdminOrderTable';
import OrderDetailModal from './components/OrderDetailModal';
import OrderAddModal from './components/OrderAddModal';
import OrderEditModal from './components/OrderEditModal';
import OrderHistoryModal from './components/OrderHistoryModal';
import { ConfirmModal, CancelReasonModal } from './components/ConfirmModal';

const STATUS_CONFIG = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50', icon: require('lucide-react').Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-500/20 text-blue-600 border-blue-500/50', icon: require('lucide-react').CheckCircle2 },
  preparing: { label: 'Đang chuẩn bị', color: 'bg-orange-500/20 text-orange-600 border-orange-500/50', icon: require('lucide-react').Package },
  ready: { label: 'Sẵn sàng', color: 'bg-green-500/20 text-green-600 border-green-500/50', icon: require('lucide-react').CheckCircle },
  delivered: { label: 'Đã giao', color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/50', icon: require('lucide-react').Truck },
  completed: { label: 'Hoàn thành', color: 'bg-green-600/20 text-green-700 border-green-600/50', icon: require('lucide-react').CheckCircle2 },
  cancelled: { label: 'Đã hủy', color: 'bg-red-500/20 text-red-600 border-red-500/50', icon: require('lucide-react').XCircle },
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'delivered,completed', label: 'Nhóm: Thành công' },
  { value: 'pending,confirmed,preparing,ready', label: 'Nhóm: Đang xử lý' },
  { value: 'cancelled,deleted', label: 'Nhóm: Đã hủy & xóa' },
  { value: 'divider1', label: '──────────', disabled: true },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'preparing', label: 'Đang chuẩn bị' },
  { value: 'ready', label: 'Sẵn sàng' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'deleted', label: 'Đã xóa' },
];

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed'];

const getNextStatus = (currentStatus) => {
  if (currentStatus === 'cancelled') return null;
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[currentIndex + 1];
};

export default function AdminOrders() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-muted-foreground">Đang tải cấu hình...</div>
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('sv-SE');
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString('sv-SE');

  const initialDateFrom = searchParams.get('date_from') || firstDay;
  const initialDateTo = searchParams.get('date_to') || lastDay;
  const initialDiscountFilter = searchParams.get('discount_filter') || 'all';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', isVisible: false, type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
  const [discountFilter, setDiscountFilter] = useState(initialDiscountFilter); // Use initial value
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
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
  const [allFoods, setAllFoods] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [foodSearchTerm, setFoodSearchTerm] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [discountPercent, setDiscountPercent] = useState(0);

  const [adminRole, setAdminRole] = useState(null);
  const detailModalRef = useRef(null);
  const editModalRef = useRef(null);
  const confirmModalRef = useRef(null);
  const cancelReasonModalRef = useRef(null);
  const historyModalRef = useRef(null);

  useEffect(() => {
    const adminData = localStorage.getItem('admin_data');
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        setAdminRole(admin.role || admin.role_name);
      } catch (e) { console.error('Error parsing admin data:', e); }
    }
  }, []);

  // Sync filter with URL parameter if it changes
  useEffect(() => {
    const statusParam = searchParams.get('status') || 'all';
    const fromParam = searchParams.get('date_from') || firstDay;
    const toParam = searchParams.get('date_to') || lastDay;
    const discParam = searchParams.get('discount_filter') || 'all';

    let changed = false;
    if (statusParam !== statusFilter) {
      setStatusFilter(statusParam);
      changed = true;
    }
    if (fromParam !== dateFrom) {
      setDateFrom(fromParam);
      changed = true;
    }
    if (toParam !== dateTo) {
      setDateTo(toParam);
      changed = true;
    }
    if (discParam !== discountFilter) {
      setDiscountFilter(discParam);
      changed = true;
    }

    if (changed) {
      setPagination(prev => ({ ...prev, page: 1 }));
      // fetchOrders is handled by the dependency array of the primary useEffect
    }
  }, [searchParams]);

  useEffect(() => {
    fetchOrders();
    fetchAllFoods();
    fetchCategories();
  }, [pagination.page, statusFilter, customerTypeFilter, discountFilter, dateFrom, dateTo]);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (isSaving || isConfirmingAction || updatingOrderId || deletingOrderId) return;
      const isLayeredModalOpen = showConfirmModal || showCancelReasonModal || showHistoryModal;

      if (showDetailModal && !isLayeredModalOpen && detailModalRef.current && !detailModalRef.current.contains(event.target)) {
        setShowDetailModal(false);
        setSelectedOrder(null);
      }
      if (showEditModal && !isLayeredModalOpen && editModalRef.current && !editModalRef.current.contains(event.target)) {
        setShowEditModal(false);
        setSelectedOrder(null);
      }
      if (showConfirmModal && confirmModalRef.current && !confirmModalRef.current.contains(event.target)) {
        setShowConfirmModal(false);
        setConfirmAction(null);
      }
      if (showCancelReasonModal && cancelReasonModalRef.current && !cancelReasonModalRef.current.contains(event.target)) {
        setShowCancelReasonModal(false);
        setCancelReason('');
      }
      if (showHistoryModal && historyModalRef.current && !historyModalRef.current.contains(event.target)) {
        setShowHistoryModal(false);
      }
    }
    if (showDetailModal || showEditModal || showConfirmModal || showCancelReasonModal || showHistoryModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDetailModal, showEditModal, showConfirmModal, showCancelReasonModal, showHistoryModal, isSaving, isConfirmingAction, updatingOrderId, deletingOrderId]);

  useEffect(() => {
    if (showDetailModal || showEditModal || showConfirmModal || showCancelReasonModal || showHistoryModal || showAddModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showDetailModal, showEditModal, showConfirmModal, showCancelReasonModal, showHistoryModal, showAddModal]);

  const showToastMsg = (message, type = 'success') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }));
    }
  };

  const fetchAllFoods = async () => {
    try {
      const response = await fetch('/api/food?limit=1000&is_available=true');
      const data = await response.json();
      if (data.success) setAllFoods(data.data || []);
    } catch (err) { console.error('Error fetching foods:', err); }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?limit=100');
      const data = await response.json();
      if (data.success) setCategories(data.data || []);
    } catch (err) { console.error('Error fetching categories:', err); }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (customerTypeFilter !== 'all') params.append('customer_type', customerTypeFilter);
      if (discountFilter !== 'all') params.append('discount_filter', discountFilter); // Added discount_filter
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (searchTerm) params.append('search', searchTerm);

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
        showToastMsg(data.error || 'Lỗi khi tải danh sách đơn hàng', 'error');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      showToastMsg('Lỗi kết nối. Vui lòng thử lại sau.', 'error');
    } finally { setLoading(false); }
  };

  const handleSearch = async () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearching(true);
    try { await fetchOrders(); } finally { setSearching(false); }
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    if (newStatus === 'cancelled') {
      setPendingCancelOrderId(orderId);
      setPendingCancelStatus(newStatus);
      setCancelReason('');
      setShowCancelReasonModal(true);
      return;
    }

    const nextStatusLabel = STATUS_CONFIG[newStatus]?.label;
    setConfirmMessage(`Bạn có chắc chắn muốn đổi status sang "${nextStatusLabel}"?`);
    setConfirmAction(() => async () => {
      try {
        setUpdatingOrderId(orderId);
        setIsConfirmingAction(true);
        const adminData = localStorage.getItem('admin_data');
        let adminPhone = null;
        if (adminData) {
          const admin = JSON.parse(adminData);
          adminPhone = admin.phone;
        }

        const response = await adminFetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-admin-phone': adminPhone || '' },
          body: JSON.stringify({ status: newStatus, changed_by: 'admin', currentAdminPhone: adminPhone }),
        });

        const data = await response.json();
        if (data.success) {
          showToastMsg('Đã cập nhật status thành công!', 'success');
          fetchOrders();
        } else {
          showToastMsg(data.error || 'Không thể cập nhật status', 'error');
        }
      } catch (err) {
        console.error('Error updating order:', err);
        showToastMsg('Lỗi khi cập nhật đơn hàng', 'error');
      } finally {
        setUpdatingOrderId(null);
        setIsConfirmingAction(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleQuickUpdateStatus = (order) => {
    const nextStatus = getNextStatus(order.status);
    if (nextStatus) handleUpdateStatus(order.order_id, nextStatus);
  };

  const handleConfirmCancel = async () => {
    if (!pendingCancelOrderId || !pendingCancelStatus) return;
    setShowCancelReasonModal(false);
    setConfirmMessage(`Bạn có chắc chắn muốn hủy đơn hàng này?`);
    setConfirmAction(() => async () => {
      try {
        setUpdatingOrderId(pendingCancelOrderId);
        setIsConfirmingAction(true);
        const adminData = localStorage.getItem('admin_data');
        let adminPhone = null;
        if (adminData) {
          const admin = JSON.parse(adminData);
          adminPhone = admin.phone;
        }

        const response = await adminFetch(`/api/orders/${pendingCancelOrderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-admin-phone': adminPhone || '' },
          body: JSON.stringify({
            status: pendingCancelStatus,
            changed_by: 'admin',
            currentAdminPhone: adminPhone,
            cancel_reason: cancelReason.trim() || '',
          }),
        });

        const data = await response.json();
        if (data.success) {
          showToastMsg('Đã hủy đơn hàng thành công!', 'success');
          fetchOrders();
        } else {
          showToastMsg(data.error || 'Không thể hủy đơn hàng', 'error');
        }
      } catch (err) {
        console.error('Error cancelling order:', err);
        showToastMsg('Lỗi khi hủy đơn hàng', 'error');
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
    setConfirmMessage('Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng này? Thao tác này không thể hoàn tác.');
    setConfirmAction(() => async () => {
      try {
        setDeletingOrderId(orderId);
        setIsConfirmingAction(true);
        const response = await adminFetch(`/api/orders/${orderId}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          showToastMsg('Đã xóa đơn hàng vĩnh viễn!', 'success');
          fetchOrders();
        } else {
          showToastMsg(data.error || 'Không thể xóa đơn hàng', 'error');
        }
      } catch (err) {
        console.error('Error deleting order:', err);
        showToastMsg('Lỗi khi xóa đơn hàng', 'error');
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
        showToastMsg(data.error || 'Không thể lấy chi tiết đơn hàng', 'error');
      }
    } catch (err) {
      console.error('Error fetching order detail:', err);
      showToastMsg('Lỗi khi lấy chi tiết đơn hàng', 'error');
    } finally { setViewingDetailId(null); }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setEditingStatus(order.status);
    setEditingAdminNotes(order.admin_notes || '');
    setEditingCustomerName(order.customer_name || '');
    setEditingCustomerPhone(order.customer_phone || '');
    setEditingCustomerAddress(order.customer_address || '');
    setEditingTotalPrice(order.total_price || 0);
    setEditingItems(order.items && Array.isArray(order.items) ? [...order.items] : []);
    setDiscountPercent(order.discount_percent || 0);
    setShowEditModal(true);
  };

  const handleAddOrder = () => {
    const adminData = localStorage.getItem('admin_data');
    let adminInfo = {};
    if (adminData) {
      try {
        adminInfo = JSON.parse(adminData);
      } catch (e) { console.error('Error parsing admin data:', e); }
    }

    setSelectedOrder(null);
    setEditingStatus('pending');
    setEditingAdminNotes('');
    setEditingCustomerName(adminInfo.fullname || adminInfo.name || '');
    setEditingCustomerPhone(adminInfo.phone || '');
    setEditingCustomerAddress(adminInfo.address || '');
    setCustomerEmail(adminInfo.email || '');
    setEditingTotalPrice(0);
    setEditingItems([]);
    setDiscountPercent(0);
    setSelectedCategory('all');
    setShowAddModal(true);
  };

  const handleSaveNewOrder = async () => {
    const adminData = localStorage.getItem('admin_data');
    let adminPhone = null, adminId = null;
    if (adminData) {
      const admin = JSON.parse(adminData);
      adminPhone = admin.phone;
      adminId = admin.user_id || admin.id;
    }

    if (!editingCustomerName.trim()) return showToastMsg('Tên khách hàng là bắt buộc', 'error');
    if (!editingCustomerPhone.trim()) return showToastMsg('Số điện thoại là bắt buộc', 'error');
    if (!customerEmail.trim()) return showToastMsg('Email là bắt buộc để đặt hàng', 'error');
    if (editingItems.length === 0) return showToastMsg('Đơn hàng phải có ít nhất 1 món', 'error');
    if (editingTotalPrice <= 0) return showToastMsg('Tổng tiền phải > 0', 'error');

    setIsSaving(true);
    try {
      const response = await adminFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-phone': adminPhone || '' },
        body: JSON.stringify({
          customer_name: editingCustomerName.trim(),
          customer_phone: editingCustomerPhone.trim(),
          customer_address: editingCustomerAddress.trim() || '',
          customer_email: customerEmail.trim(),
          items: editingItems,
          total_price: editingTotalPrice,
          status: editingStatus,
          admin_notes: editingAdminNotes.trim() || '',
          discount_percent: discountPercent || 0,
          original_price: discountPercent > 0
            ? Math.round(editingTotalPrice / (1 - discountPercent / 100))
            : editingTotalPrice,
          user_id: adminId,
          created_by_admin: true,
          created_by_admin_detail: adminData ? {
            user_id: adminId,
            name: JSON.parse(adminData).fullname || JSON.parse(adminData).name || 'Admin',
          } : null,
        }),
      });
      const data = await response.json();
      if (data.success) {
        showToastMsg('Tạo đơn hàng thành công!', 'success');

        // Reset form để tạo tiếp mẫu khác nhưng không đóng modal
        const adminData = localStorage.getItem('admin_data');
        let adminInfo = {};
        if (adminData) {
          try { adminInfo = JSON.parse(adminData); } catch (e) { }
        }

        setEditingAdminNotes('');
        setEditingCustomerName(adminInfo.fullname || adminInfo.name || '');
        setEditingCustomerPhone(adminInfo.phone || '');
        setEditingCustomerAddress(adminInfo.address || '');
        setCustomerEmail(adminInfo.email || '');
        setEditingTotalPrice(0);
        setEditingItems([]);
        setDiscountPercent(0);
        setSelectedCategory('all');
        setFoodSearchTerm('');

        fetchOrders();
      } else { showToastMsg(data.error || 'Không thể tạo đơn hàng', 'error'); }
    } catch (err) {
      console.error('Error creating order:', err);
      showToastMsg('Lỗi khi tạo đơn hàng', 'error');
    } finally { setIsSaving(false); }
  };

  const handleSaveEditOrder = async () => {
    if (!selectedOrder) return;
    const adminData = localStorage.getItem('admin_data');
    let adminPhone = null;
    if (adminData) {
      const admin = JSON.parse(adminData);
      adminPhone = admin.phone;
    }

    if (!editingCustomerName.trim()) return showToastMsg('Tên khách hàng là bắt buộc', 'error');
    if (!editingCustomerPhone.trim()) return showToastMsg('Số điện thoại là bắt buộc', 'error');
    if (editingItems.length === 0) return showToastMsg('Đơn hàng phải có ít nhất 1 món', 'error');
    if (editingTotalPrice <= 0) return showToastMsg('Tổng tiền phải > 0', 'error');

    setIsSaving(true);
    try {
      const response = await adminFetch(`/api/orders/${selectedOrder.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-phone': adminPhone || '' },
        body: JSON.stringify({
          status: editingStatus,
          admin_notes: editingAdminNotes.trim() || '',
          customer_name: editingCustomerName.trim(),
          customer_phone: editingCustomerPhone.trim(),
          customer_address: editingCustomerAddress.trim() || '',
          items: editingItems,
          total_price: editingTotalPrice,
          discount_percent: discountPercent || 0,
          original_price: discountPercent > 0
            ? Math.round(editingTotalPrice / (1 - discountPercent / 100))
            : editingTotalPrice,
          changed_by: 'admin',
          currentAdminPhone: adminPhone,
        }),
      });
      const data = await response.json();
      if (data.success) {
        showToastMsg('Đã cập nhật đơn hàng thành công!', 'success');
        setShowEditModal(false);
        fetchOrders();
      } else { showToastMsg(data.error || 'Không thể cập nhật đơn hàng', 'error'); }
    } catch (err) {
      console.error('Error updating order:', err);
      showToastMsg('Lỗi khi cập nhật đơn hàng', 'error');
    } finally { setIsSaving(false); }
  };

  const getItemCount = (order) => {
    if (order.items && Array.isArray(order.items)) return order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    return order.quantity || 1;
  };

  const getItemNames = (order) => {
    if (order.items && Array.isArray(order.items)) return order.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
    return 'N/A';
  };

  if (loading && orders.length === 0) {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-7 h-7 text-primary" />
          <h1 className="text-2xl lg:text-3xl font-bold text-card-foreground">Quản lý Đơn hàng</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleAddOrder} className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium text-sm cursor-pointer flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Thêm đơn hàng</span>
          </button>
          <button onClick={fetchOrders} disabled={loading} className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Đang tải...</span></> : 'Làm mới'}
          </button>
        </div>
      </div>

      <OrderFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        searching={searching}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        customerTypeFilter={customerTypeFilter}
        setCustomerTypeFilter={setCustomerTypeFilter}
        discountFilter={discountFilter}
        setDiscountFilter={setDiscountFilter}
        setPagination={setPagination}
        STATUS_OPTIONS={STATUS_OPTIONS}
      />

      <AdminOrderTable
        orders={orders} loading={loading} searchTerm={searchTerm} statusFilter={statusFilter}
        STATUS_CONFIG={STATUS_CONFIG} getNextStatus={getNextStatus} handleQuickUpdateStatus={handleQuickUpdateStatus}
        updatingOrderId={updatingOrderId} handleViewDetail={handleViewDetail} viewingDetailId={viewingDetailId}
        handleEdit={handleEdit} handleDelete={handleDelete} deletingOrderId={deletingOrderId}
        getItemNames={getItemNames} getItemCount={getItemCount}
        adminRole={adminRole}
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))} disabled={pagination.page === 1} className="px-4 py-2 bg-card border border-border rounded-lg text-card-foreground hover:bg-muted disabled:opacity-50 transition-colors">Trước</button>
          <span className="px-4 py-2 text-sm text-muted-foreground">Trang {pagination.page} / {pagination.totalPages}</span>
          <button onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))} disabled={pagination.page === pagination.totalPages} className="px-4 py-2 bg-card border border-border rounded-lg text-card-foreground hover:bg-muted disabled:opacity-50 transition-colors">Sau</button>
        </div>
      )}

      <OrderDetailModal
        isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} order={selectedOrder}
        STATUS_CONFIG={STATUS_CONFIG} setShowHistoryModal={setShowHistoryModal} modalRef={detailModalRef}
      />

      <OrderAddModal
        isOpen={showAddModal} onClose={() => setShowAddModal(false)} allFoods={allFoods} categories={categories}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        foodSearchTerm={foodSearchTerm} setFoodSearchTerm={setFoodSearchTerm}
        editingItems={editingItems} setEditingItems={setEditingItems}
        editingTotalPrice={editingTotalPrice} setEditingTotalPrice={setEditingTotalPrice}
        editingCustomerName={editingCustomerName} setEditingCustomerName={setEditingCustomerName}
        editingCustomerPhone={editingCustomerPhone} setEditingCustomerPhone={setEditingCustomerPhone}
        editingCustomerAddress={editingCustomerAddress} setEditingCustomerAddress={setEditingCustomerAddress}
        customerEmail={customerEmail} setCustomerEmail={setCustomerEmail}
        editingAdminNotes={editingAdminNotes} setEditingAdminNotes={setEditingAdminNotes}
        editingStatus={editingStatus} setEditingStatus={setEditingStatus}
        STATUS_OPTIONS={STATUS_OPTIONS} isSaving={isSaving} onSave={handleSaveNewOrder}
        discountPercent={discountPercent} setDiscountPercent={setDiscountPercent}
      />

      <OrderEditModal
        isOpen={showEditModal} onClose={() => setShowEditModal(false)} selectedOrder={selectedOrder}
        allFoods={allFoods} categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        foodSearchTerm={foodSearchTerm} setFoodSearchTerm={setFoodSearchTerm}
        editingItems={editingItems} setEditingItems={setEditingItems}
        editingTotalPrice={editingTotalPrice} setEditingTotalPrice={setEditingTotalPrice}
        editingCustomerName={editingCustomerName} setEditingCustomerName={setEditingCustomerName}
        editingCustomerPhone={editingCustomerPhone} setEditingCustomerPhone={setEditingCustomerPhone}
        editingCustomerAddress={editingCustomerAddress} setEditingCustomerAddress={setEditingCustomerAddress}
        editingAdminNotes={editingAdminNotes} setEditingAdminNotes={setEditingAdminNotes}
        editingStatus={editingStatus} setEditingStatus={setEditingStatus}
        STATUS_OPTIONS={STATUS_OPTIONS} isSaving={isSaving} onSave={handleSaveEditOrder}
        adminRole={adminRole}
        discountPercent={discountPercent} setDiscountPercent={setDiscountPercent}
      />

      <OrderHistoryModal
        isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)}
        order={selectedOrder} modalRef={historyModalRef}
      />

      <ConfirmModal
        isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction} message={confirmMessage} isConfirming={isConfirmingAction} modalRef={confirmModalRef}
      />

      <CancelReasonModal
        isOpen={showCancelReasonModal} onClose={() => setShowCancelReasonModal(false)}
        onConfirm={handleConfirmCancel} cancelReason={cancelReason} setCancelReason={setCancelReason} modalRef={cancelReasonModalRef}
      />

      {toast.isVisible && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
      )}
    </div>
  );
}
