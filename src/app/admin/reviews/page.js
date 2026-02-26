'use client';

import { useState, useEffect, useRef } from 'react';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import Toast from '@/components/Toast/Toast';
import {
  Star,
  Loader2,
  Search,
  Filter,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar,
  Info,
  Settings,
  User,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Eye,
  Menu,
  RotateCcw,
  Save,
  Check
} from 'lucide-react';
import * as lucideIcons from 'lucide-react';
import { adminFetch } from '@/lib/adminAuth';

// Helper function để lấy icon component
const getLucideIcon = (iconName) => {
  if (!iconName || typeof iconName !== 'string') {
    return null;
  }
  try {
    const variants = [
      iconName,
      iconName.charAt(0).toUpperCase() + iconName.slice(1),
      iconName + 'Icon',
    ];

    for (const variant of variants) {
      const icon = lucideIcons[variant];
      if (icon && (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof))) {
        return icon;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

const RATING_COLORS = {
  5: 'text-yellow-400',
  4: 'text-yellow-300',
  3: 'text-yellow-200',
  2: 'text-gray-400',
  1: 'text-gray-500',
};

// Bảng màu cho reviews (giống như FEATURE_COLORS trong landing-config)
const REVIEW_COLORS = [
  { color: 'from-green-500/20 to-emerald-600/10', borderColor: 'border-green-500/30' },
  { color: 'from-orange-500/20 to-amber-600/10', borderColor: 'border-orange-500/30' },
  { color: 'from-blue-500/20 to-cyan-600/10', borderColor: 'border-blue-500/30' },
  { color: 'from-purple-500/20 to-violet-600/10', borderColor: 'border-purple-500/30' },
  { color: 'from-pink-500/20 to-rose-600/10', borderColor: 'border-pink-500/30' },
  { color: 'from-yellow-500/20 to-amber-600/10', borderColor: 'border-yellow-500/30' },
];

export default function AdminReviews() {
  const { isAuthorized, isChecking } = useRoleCheck(['admin', 'super_admin']);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, approved, pending
  const [ratingFilter, setRatingFilter] = useState('all'); // all, 5, 4, 3, 2, 1
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // all, visible, hidden
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [isApprovingId, setIsApprovingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const editModalRef = useRef(null);
  const deleteModalRef = useRef(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    customer_name: '',
    rating: 5,
    comment: '',
    is_approved: false,
    is_visible: false,
    avatar: '👤',
    color: 'from-primary/20 to-primary-light/10',
    borderColor: 'border-primary/30',
  });

  // Track previous filter values để reset page khi filter thay đổi
  const prevFiltersRef = useRef({ statusFilter, ratingFilter, visibilityFilter, searchTerm, dateFrom, dateTo });

  useEffect(() => {
    // Kiểm tra xem có filter nào thay đổi không (trừ pagination.page)
    const filtersChanged =
      prevFiltersRef.current.statusFilter !== statusFilter ||
      prevFiltersRef.current.ratingFilter !== ratingFilter ||
      prevFiltersRef.current.visibilityFilter !== visibilityFilter ||
      prevFiltersRef.current.searchTerm !== searchTerm ||
      prevFiltersRef.current.dateFrom !== dateFrom ||
      prevFiltersRef.current.dateTo !== dateTo;

    if (filtersChanged) {
      // Reset về trang 1 khi filter thay đổi
      setPagination(prev => ({ ...prev, page: 1 }));
      prevFiltersRef.current = { statusFilter, ratingFilter, visibilityFilter, searchTerm, dateFrom, dateTo };
    }
  }, [statusFilter, ratingFilter, visibilityFilter, searchTerm, dateFrom, dateTo]);

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, ratingFilter, visibilityFilter, pagination.page, searchTerm, dateFrom, dateTo]);

  // Listen for toast events
  useEffect(() => {
    const handleShowToast = (event) => {
      setToast({ message: event.detail.message, isVisible: true, type: event.detail.type });
      setTimeout(() => setToast({ message: '', isVisible: false, type: null }), 3000);
    };

    window.addEventListener('showToast', handleShowToast);
    return () => window.removeEventListener('showToast', handleShowToast);
  }, []);

  // Handle click outside to close modals
  useEffect(() => {
    function handleClickOutside(event) {
      // Don't close if an operation is active
      if (isSaving || isDeleting) return;

      if (showEditModal && editModalRef.current && !editModalRef.current.contains(event.target)) {
        setShowEditModal(false);
      }
      if (showDeleteModal && deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowDeleteModal(false);
      }
    }

    if (showEditModal || showDeleteModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEditModal, showDeleteModal, isSaving, isDeleting]);

  // Handle scroll lock when modal is open
  useEffect(() => {
    if (showEditModal || showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showEditModal, showDeleteModal]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let url = `/api/reviews?limit=${pagination.limit}&skip=${(pagination.page - 1) * pagination.limit}`;

      // Filter by approval status
      if (statusFilter === 'approved') {
        url += '&approved=true';
      } else if (statusFilter === 'pending') {
        url += '&approved=false';
      } else if (statusFilter === 'all') {
        // Admin có thể xem tất cả reviews (bao gồm cả pending)
        url += '&all=true';
      }

      // Filter by rating (gửi lên backend)
      if (ratingFilter !== 'all') {
        url += `&rating=${ratingFilter}`;
      }

      // Filter by visibility (gửi lên backend)
      if (visibilityFilter !== 'all') {
        url += `&visible=${visibilityFilter === 'visible' ? 'true' : 'false'}`;
      }

      // Filter by search term (gửi lên backend)
      if (searchTerm && searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }

      // Filter by date range (gửi lên backend)
      if (dateFrom) {
        url += `&date_from=${dateFrom}`;
      }
      if (dateTo) {
        url += `&date_to=${dateTo}`;
      }

      const res = await adminFetch(url);
      const data = await res.json();

      if (data.success) {
        // Dữ liệu đã được filter từ backend, không cần filter lại ở frontend
        setReviews(data.data);
        setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }));
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setToast({ message: data.error || 'Lỗi khi tải danh sách đánh giá', isVisible: true, type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setToast({ message: 'Lỗi khi tải danh sách đánh giá', isVisible: true, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await adminFetch('/api/reviews/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (review, approved) => {
    setIsApprovingId(review._id);
    try {
      const res = await adminFetch(`/api/reviews/${review._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: approved }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({
          message: approved ? 'Đã duyệt đánh giá' : 'Đã hủy duyệt đánh giá',
          isVisible: true,
          type: 'success'
        });
        fetchReviews();
      } else {
        setToast({ message: data.error || 'Lỗi khi cập nhật', isVisible: true, type: 'error' });
      }
    } catch (error) {
      console.error('Error updating review:', error);
      setToast({ message: 'Lỗi khi cập nhật đánh giá', isVisible: true, type: 'error' });
    } finally {
      setIsApprovingId(null);
    }
  };

  // Hàm tự động generate màu dựa trên rating
  const generateColors = (rating) => {
    const colorMap = {
      5: { color: 'from-green-500/20 to-emerald-600/10', borderColor: 'border-green-500/30' },
      4: { color: 'from-blue-500/20 to-cyan-600/10', borderColor: 'border-blue-500/30' },
      3: { color: 'from-yellow-500/20 to-amber-600/10', borderColor: 'border-yellow-500/30' },
      2: { color: 'from-orange-500/20 to-red-600/10', borderColor: 'border-orange-500/30' },
      1: { color: 'from-red-500/20 to-rose-600/10', borderColor: 'border-red-500/30' },
    };
    return colorMap[rating] || { color: 'from-primary/20 to-primary-light/10', borderColor: 'border-primary/30' };
  };

  const handleOpenEditModal = (review) => {
    setSelectedReview(review);
    setEditForm({
      customer_name: review.customer_name || '',
      rating: review.rating || 5,
      comment: review.comment || '',
      is_approved: review.is_approved !== false,
      is_visible: review.is_visible !== false,
      avatar: review.avatar || '👤',
      color: review.color || 'from-primary/20 to-primary-light/10',
      borderColor: review.borderColor || 'border-primary/30',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedReview) return;

    setIsSaving(true);
    try {
      // Nếu chưa được duyệt, tự động tắt hiển thị
      const updateData = { ...editForm };
      if (updateData.is_approved === false) {
        updateData.is_visible = false;
      }

      const res = await adminFetch(`/api/reviews/${selectedReview._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: 'Cập nhật đánh giá thành công', isVisible: true, type: 'success' });
        setShowEditModal(false);
        fetchReviews();
        fetchStats();
      } else {
        setToast({ message: data.error || 'Lỗi khi cập nhật', isVisible: true, type: 'error' });
      }
    } catch (error) {
      console.error('Error updating review:', error);
      setToast({ message: 'Lỗi khi cập nhật đánh giá', isVisible: true, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    setIsDeleting(true);
    try {
      const res = await adminFetch(`/api/reviews/${selectedReview._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: 'Xóa đánh giá thành công', isVisible: true, type: 'success' });
        setShowDeleteModal(false);
        fetchReviews();
        fetchStats();
      } else {
        setToast({ message: data.error || 'Lỗi khi xóa', isVisible: true, type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      setToast({ message: 'Lỗi khi xóa đánh giá', isVisible: true, type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  // Không cần filter ở frontend nữa vì đã filter từ backend
  const filteredReviews = reviews;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Quản lý Đánh giá</h1>
                <p className="text-sm text-muted-foreground mt-1">Duyệt, chỉnh sửa và quản lý trải nghiệm khách hàng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {[
              {
                label: 'Điểm trung bình',
                value: `${stats.averageRating}/5`,
                icon: Star,
                color: 'text-yellow-500',
                bgColor: 'bg-yellow-500/10',
                borderColor: 'border-yellow-500/20',
                info: 'Điểm trung bình từ các đánh giá đã phê duyệt'
              },
              {
                label: 'Tổng đánh giá',
                value: stats.totalAllReviews || stats.totalReviews || 0,
                icon: MessageSquare,
                color: 'text-primary',
                bgColor: 'bg-primary/10',
                borderColor: 'border-primary/20',
                info: 'Tổng số tất cả đánh giá nhận được'
              },
              {
                label: 'Đã phê duyệt',
                value: stats.totalApproved || 0,
                icon: CheckCircle2,
                color: 'text-emerald-500',
                bgColor: 'bg-emerald-500/10',
                borderColor: 'border-emerald-500/20',
                info: 'Số lượng đánh giá đã được duyệt hiển thị'
              },
              {
                label: 'Chờ xử lý',
                value: stats.totalPending || 0,
                icon: XCircle,
                color: 'text-amber-500',
                bgColor: 'bg-amber-500/10',
                borderColor: 'border-amber-500/20',
                info: 'Các đánh giá mới đang chờ quản trị viên duyệt'
              }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-card rounded-xl sm:rounded-2xl border border-border p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-all group relative"
              >
                {/* Background Wave with its own overflow management to avoid clipping tooltips */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]">
                  <div className={`absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 ${stat.bgColor} opacity-20 rounded-bl-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 transition-transform group-hover:scale-110`} />
                </div>

                <div className="flex items-start justify-between mb-3 sm:mb-4 relative z-10">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bgColor} ${stat.borderColor} border rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color} ${stat.icon === Star ? 'fill-current' : ''}`} />
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-medium leading-tight text-right flex-1 ml-3 pt-0.5">
                    {stat.info}
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5 sm:mt-1">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-8 shadow-sm transition-all duration-300">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 flex gap-3">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm nội dung feedback, tên khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                />
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`lg:hidden relative flex items-center justify-center w-12 h-12 rounded-xl border transition-all active:scale-95 ${showMobileFilters || statusFilter !== 'all' || ratingFilter !== 'all' || visibilityFilter !== 'all' || dateFrom || dateTo
                  ? 'bg-primary/10 border-primary/30 text-primary shadow-sm'
                  : 'bg-muted/40 border-border text-muted-foreground'
                  }`}
              >
                <Filter className="w-5 h-5" />
                {(statusFilter !== 'all' || ratingFilter !== 'all' || visibilityFilter !== 'all' || dateFrom || dateTo) && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full ring-2 ring-background shadow-sm">
                    {[statusFilter !== 'all', ratingFilter !== 'all', visibilityFilter !== 'all', dateFrom !== '', dateTo !== ''].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Filters (Always visible on large screens) */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="h-10 w-[1px] bg-border/60 mx-1" />
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setVisibilityFilter('all');
                  setRatingFilter('all');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                Xóa lọc
              </button>
            </div>
          </div>

          {/* Collapsible Mobile / Extended Filters */}
          <div className={`${showMobileFilters ? 'grid animate-in slide-in-from-top-4 duration-300' : 'hidden'} lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 pt-4 mt-4 border-t border-border/50`}>
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Trạng thái</label>
              <div className="relative">
                <Menu className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="approved">Đã phê duyệt</option>
                  <option value="pending">Đang chờ</option>
                </select>
                <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Đánh giá</label>
              <div className="relative">
                <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                >
                  <option value="all">Tất cả mức sao</option>
                  {[5, 4, 3, 2, 1].map(r => (
                    <option key={r} value={r}>{r} Sao</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* Visibility Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Hiển thị</label>
              <div className="relative">
                <Eye className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                >
                  <option value="all">Tất cả</option>
                  <option value="visible">Đang hiển thị</option>
                  <option value="hidden">Đang ẩn</option>
                </select>
                <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* Date Filters */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Từ ngày</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Đến ngày</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Mobile Reset (Visible only on mobile inside toggle) */}
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setVisibilityFilter('all');
                setRatingFilter('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="lg:hidden w-full flex items-center justify-center gap-2 py-3 mt-2 text-sm font-bold text-destructive bg-destructive/5 rounded-xl border border-dashed border-destructive/30 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Thiết lập lại bộ lọc
            </button>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Đang tải danh sách đánh giá...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-sm border-dashed">
            <div className="w-20 h-20 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Không tìm thấy đánh giá</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden bg-white dark:bg-card border border-border rounded-2xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Nội dung feedback</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Đánh giá</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Ngày gửi</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReviews.map((review) => (
                      <tr key={review._id} className="hover:bg-muted/10 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0">
                              {review.avatar || '👤'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground">{review.customer_name}</span>
                              <span className="text-xs text-muted-foreground">{review.customer_phone || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs xl:max-w-md">
                          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2 italic">"{review.comment}"</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{new Date(review.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border ${review.is_approved !== false
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              }`}>
                              {review.is_approved !== false ? <CheckCircle2 className="w-3 h-3" /> : <Loader2 className="w-3 h-3" />}
                              {review.is_approved !== false ? 'Đã duyệt' : 'Chờ duyệt'}
                            </div>
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border ${review.is_visible !== false
                              ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                              : 'bg-muted/80 text-muted-foreground border-border'
                              }`}>
                              {review.is_visible !== false ? <Eye className="w-3 h-3" /> : <Eye className="w-3 h-3 opacity-40" />}
                              {review.is_visible !== false ? 'Hiển thị' : 'Đang ẩn'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(review, !review.is_approved)}
                              disabled={isApprovingId === review._id}
                              className={`p-2 rounded-xl transition-all active:scale-95 border ${review.is_approved !== false
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                                }`}
                            >
                              {isApprovingId === review._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(review)}
                              className="p-2 bg-muted/50 text-foreground hover:bg-primary hover:text-white rounded-xl transition-all active:scale-95 border border-border"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReview(review);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-xl transition-all active:scale-95 border border-destructive/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredReviews.map((review) => (
                <div key={review._id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl shrink-0">
                        {review.avatar || '👤'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-foreground truncate">{review.customer_name}</span>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${review.is_approved !== false ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                        {review.is_approved !== false ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-xl p-4 relative">
                    <div className="absolute top-0 right-4 -translate-y-1/2 flex gap-2">
                      <span className={`p-1.5 rounded-full bg-background border border-border shadow-sm ${review.is_visible !== false ? 'text-blue-500' : 'text-muted-foreground'}`}>
                        <Eye className="w-3 h-3" />
                      </span>
                    </div>
                    <p className="text-[14px] text-foreground/80 leading-relaxed italic line-clamp-4">"{review.comment}"</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground pt-1 px-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.created_at).toLocaleDateString('vi-VN')}
                      </span>
                      {review.order_id && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          #{review.order_id.slice(-6)}
                        </span>
                      )}
                    </div>
                    <span className="font-mono">{review.customer_phone || 'N/A'}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <button
                      onClick={() => handleApprove(review, !review.is_approved)}
                      disabled={isApprovingId === review._id}
                      className="flex items-center justify-center gap-2 py-2.5 bg-muted/50 hover:bg-primary/10 text-foreground hover:text-primary rounded-xl transition-all font-bold text-xs border border-border active:scale-95"
                    >
                      {isApprovingId === review._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(review)}
                      className="flex items-center justify-center gap-2 py-2.5 bg-muted/50 hover:bg-muted-foreground/10 text-foreground rounded-xl transition-all font-bold text-xs border border-border active:scale-95"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Sửa
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setShowDeleteModal(true);
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 bg-destructive/5 hover:bg-destructive text-destructive hover:text-white rounded-xl transition-all font-bold text-xs border border-destructive/20 active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
        }

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pb-10">
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
              Hiển thị <span className="font-bold text-foreground">{(pagination.page - 1) * pagination.limit + 1}</span> - <span className="font-bold text-foreground">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> trong tổng số <span className="font-bold text-foreground">{pagination.total}</span> đánh giá
            </p>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(Math.ceil(pagination.total / pagination.limit))].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === Math.ceil(pagination.total / pagination.limit) ||
                    (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm border ${pagination.page === pageNum
                          ? 'bg-primary text-primary-foreground border-primary shadow-primary/20'
                          : 'bg-card text-foreground border-border hover:bg-muted'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    (pageNum === 2 && pagination.page > 3) ||
                    (pageNum === Math.ceil(pagination.total / pagination.limit) - 1 && pagination.page < Math.ceil(pagination.total / pagination.limit) - 2)
                  ) {
                    return <span key={i} className="px-2 text-muted-foreground">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300">
            <div
              ref={editModalRef}
              className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                    <Edit2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Chỉnh sửa đánh giá</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Cập nhật thông tin và trạng thái hiển thị</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Reviewer Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground/70 flex items-center gap-2 mb-2">
                      <User className="w-3.5 h-3.5" /> Thông tin người gửi
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 ml-1">Họ tên</label>
                        <input
                          type="text"
                          value={editForm.customer_name}
                          onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 ml-1">Số điện thoại</label>
                        <input
                          type="text"
                          value={editForm.customer_phone || ''}
                          onChange={(e) => setEditForm({ ...editForm, customer_phone: e.target.value })}
                          className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 ml-1">Avatar (Emoji)</label>
                          <input
                            type="text"
                            value={editForm.avatar}
                            onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                            className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-center text-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 ml-1">Số sao</label>
                          <select
                            value={editForm.rating}
                            onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                          >
                            {[5, 4, 3, 2, 1].map(r => (
                              <option key={r} value={r}>{r} sao</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Content & Status */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground/70 flex items-center gap-2 mb-2">
                      <MessageSquare className="w-3.5 h-3.5" /> Nội dung & Trạng thái
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 ml-1">Nội dung đánh giá</label>
                        <textarea
                          rows={4}
                          value={editForm.comment}
                          onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                          className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none italic"
                        />
                      </div>

                      <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${editForm.is_approved ? 'bg-primary border-primary' : 'border-muted-foreground/30 bg-background'}`}>
                            {editForm.is_approved && <Check className="w-3.5 h-3.5 text-white" />}
                            <input
                              type="checkbox"
                              checked={editForm.is_approved}
                              onChange={(e) => {
                                const val = e.target.checked;
                                if (!val) {
                                  setEditForm({ ...editForm, is_approved: false, is_visible: false });
                                } else {
                                  setEditForm({ ...editForm, is_approved: true });
                                }
                              }}
                              className="sr-only"
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Đã phê duyệt đánh giá</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer group transition-opacity ${!editForm.is_approved ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${editForm.is_visible ? 'bg-blue-500 border-blue-500' : 'border-muted-foreground/30 bg-background'}`}>
                            {editForm.is_visible && <Eye className="w-3.5 h-3.5 text-white" />}
                            <input
                              type="checkbox"
                              checked={editForm.is_visible}
                              onChange={(e) => {
                                if (e.target.checked && !editForm.is_approved) {
                                  setToast({ message: 'Cần duyệt đánh giá trước khi hiển thị!', isVisible: true, type: 'error' });
                                  return;
                                }
                                setEditForm({ ...editForm, is_visible: e.target.checked });
                              }}
                              disabled={!editForm.is_approved}
                              className="sr-only"
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Hiển thị trên trang chủ</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border bg-muted/20 flex items-center gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-muted hover:bg-muted-foreground/10 text-foreground font-bold rounded-xl transition-all border border-border disabled:opacity-50 active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedReview && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 transition-all duration-300">
            <div
              ref={deleteModalRef}
              className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center"
            >
              <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-destructive/5">
                <Trash2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Xác nhận xóa</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Bạn có chắc chắn muốn xóa đánh giá của <span className="font-bold text-foreground">"{selectedReview.customer_name}"</span>?
                Hành động này <span className="text-destructive font-bold underline decoration-destructive/30 underline-offset-4">không thể hoàn tác</span>.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-3 bg-muted hover:bg-muted-foreground/10 text-foreground font-bold rounded-xl transition-all border border-border disabled:opacity-50 active:scale-95"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-3 bg-destructive text-white font-bold rounded-xl shadow-lg shadow-destructive/20 hover:bg-destructive/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Xác nhận xóa</span>
                  )}
                </button>
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
    </div>
  );
}

