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
  MessageSquare
} from 'lucide-react';
import * as lucideIcons from 'lucide-react';

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

export default function AdminReviews() {
  const { isAuthorized, isChecking } = useRoleCheck(['admin', 'super_admin']);
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, approved, pending
  const [ratingFilter, setRatingFilter] = useState('all'); // all, 5, 4, 3, 2, 1
  const [selectedReview, setSelectedReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  // Edit form state
  const [editForm, setEditForm] = useState({
    customer_name: '',
    rating: 5,
    comment: '',
    is_approved: false,
    avatar: '👤',
    color: 'from-primary/20 to-primary-light/10',
    borderColor: 'border-primary/30',
  });

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [statusFilter, ratingFilter, pagination.page]);

  // Listen for toast events
  useEffect(() => {
    const handleShowToast = (event) => {
      setToast({ message: event.detail.message, isVisible: true });
      setTimeout(() => setToast({ message: '', isVisible: false }), 3000);
    };

    window.addEventListener('showToast', handleShowToast);
    return () => window.removeEventListener('showToast', handleShowToast);
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let url = `/api/reviews?limit=${pagination.limit}&skip=${(pagination.page - 1) * pagination.limit}`;
      
      if (statusFilter === 'approved') {
        url += '&approved=true';
      } else if (statusFilter === 'pending') {
        url += '&approved=false';
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        let filteredReviews = data.data;
        
        // Filter by rating
        if (ratingFilter !== 'all') {
          filteredReviews = filteredReviews.filter(r => r.rating === parseInt(ratingFilter));
        }
        
        // Filter by search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredReviews = filteredReviews.filter(r => 
            r.customer_name?.toLowerCase().includes(term) ||
            r.comment?.toLowerCase().includes(term) ||
            r.customer_phone?.includes(term) ||
            r.customer_email?.toLowerCase().includes(term)
          );
        }
        
        setReviews(filteredReviews);
        setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setToast({ message: 'Lỗi khi tải danh sách đánh giá', isVisible: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/reviews/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (review, approved) => {
    try {
      const res = await fetch(`/api/reviews/${review._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: approved }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ 
          message: approved ? 'Đã duyệt đánh giá' : 'Đã hủy duyệt đánh giá', 
          isVisible: true 
        });
        fetchReviews();
        fetchStats();
      } else {
        setToast({ message: data.error || 'Lỗi khi cập nhật', isVisible: true });
      }
    } catch (error) {
      console.error('Error updating review:', error);
      setToast({ message: 'Lỗi khi cập nhật đánh giá', isVisible: true });
    }
  };


  const handleOpenEditModal = (review) => {
    setSelectedReview(review);
    setEditForm({
      customer_name: review.customer_name || '',
      rating: review.rating || 5,
      comment: review.comment || '',
      is_approved: review.is_approved !== false,
      avatar: review.avatar || '👤',
      color: review.color || 'from-primary/20 to-primary-light/10',
      borderColor: review.borderColor || 'border-primary/30',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedReview) return;

    try {
      const res = await fetch(`/api/reviews/${selectedReview._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: 'Cập nhật đánh giá thành công', isVisible: true });
        setShowEditModal(false);
        fetchReviews();
        fetchStats();
      } else {
        setToast({ message: data.error || 'Lỗi khi cập nhật', isVisible: true });
      }
    } catch (error) {
      console.error('Error updating review:', error);
      setToast({ message: 'Lỗi khi cập nhật đánh giá', isVisible: true });
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    try {
      const res = await fetch(`/api/reviews/${selectedReview._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: 'Xóa đánh giá thành công', isVisible: true });
        setShowDeleteModal(false);
        fetchReviews();
        fetchStats();
      } else {
        setToast({ message: data.error || 'Lỗi khi xóa', isVisible: true });
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      setToast({ message: 'Lỗi khi xóa đánh giá', isVisible: true });
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

  const filteredReviews = reviews.filter(review => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        review.customer_name?.toLowerCase().includes(term) ||
        review.comment?.toLowerCase().includes(term) ||
        review.customer_phone?.includes(term) ||
        review.customer_email?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Quản lý Đánh giá</h1>
          </div>
          <p className="text-muted-foreground">Duyệt, chỉnh sửa và quản lý đánh giá từ khách hàng</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-muted-foreground">Điểm trung bình</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.averageRating}/5</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Tổng đánh giá</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.totalReviews}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-sm text-muted-foreground">Đã duyệt</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {reviews.filter(r => r.is_approved !== false).length}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-muted-foreground">Chờ duyệt</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {reviews.filter(r => r.is_approved === false).length}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chờ duyệt</option>
            </select>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="all">Tất cả điểm</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setRatingFilter('all');
              }}
              className="px-4 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 inline mr-2" />
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Không có đánh giá nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review._id}
                className={`bg-card border-2 rounded-lg p-5 ${
                  review.is_approved === false
                    ? 'border-gray-500/30 bg-gray-500/5 opacity-60' 
                    : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Review Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                        {review.avatar || '👤'}
                      </div>
                      
                      {/* Customer Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-card-foreground">{review.customer_name}</h3>
                          {review.is_approved === false && (
                            <XCircle className="w-4 h-4 text-gray-500" title="Chưa duyệt" />
                          )}
                        </div>
                        {review.customer_phone && (
                          <p className="text-xs text-muted-foreground">{review.customer_phone}</p>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating
                                ? `fill-yellow-400 text-yellow-400 ${RATING_COLORS[review.rating]}`
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 font-bold text-foreground">{review.rating}.0</span>
                      </div>
                    </div>

                    {/* Comment */}
                    <p className="text-foreground mb-3 leading-relaxed">"{review.comment}"</p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {new Date(review.created_at).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      {review.order_id && (
                        <span>Đơn hàng: {review.order_id}</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(review, !review.is_approved)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          review.is_approved !== false
                            ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30'
                        }`}
                        title={review.is_approved !== false ? 'Hủy duyệt' : 'Duyệt'}
                      >
                        {review.is_approved !== false ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleVerify(review, !review.is_verified)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          review.is_verified
                            ? 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title={review.is_verified ? 'Hủy xác minh' : 'Xác minh'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFeature(review, !review.is_featured)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          review.is_featured
                            ? 'bg-primary/20 text-primary hover:bg-primary/30'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title={review.is_featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(review)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Trước
            </button>
            <span className="text-sm text-muted-foreground">
              Trang {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="px-4 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Sau
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedReview && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-card-foreground">Chỉnh sửa đánh giá</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-muted rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Tên khách hàng <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.customer_name}
                    onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Điểm đánh giá <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setEditForm({ ...editForm, rating })}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          editForm.rating === rating
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <Star className={`w-6 h-6 ${editForm.rating >= rating ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-foreground">{editForm.rating}/5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Bình luận
                  </label>
                  <textarea
                    value={editForm.comment}
                    onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{editForm.comment.length}/500 ký tự</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Avatar (Emoji)
                  </label>
                  <input
                    type="text"
                    value={editForm.avatar}
                    onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.is_approved}
                      onChange={(e) => setEditForm({ ...editForm, is_approved: e.target.checked })}
                      className="w-4 h-4 rounded border-border cursor-pointer"
                    />
                    <span className="text-sm text-card-foreground">Đã duyệt (hiển thị trên frontend)</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark cursor-pointer"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-foreground cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedReview && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-card-foreground mb-4">Xác nhận xóa</h2>
              <p className="text-muted-foreground mb-6">
                Bạn có chắc muốn xóa đánh giá từ <strong>{selectedReview.customer_name}</strong>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                >
                  Xóa
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-foreground cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        <Toast message={toast.message} isVisible={toast.isVisible} />
      </div>
    </div>
  );
}

