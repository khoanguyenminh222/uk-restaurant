'use client';

import { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '@/utils/helpers';
import { UtensilsCrossed, Plus, Edit2, Trash2, Loader2, Image as ImageIcon, X, CheckCircle2, XCircle, Search, Filter, ChevronDown } from 'lucide-react';

export default function AdminFood() {
  const [food, setFood] = useState([]);
  const [categories, setCategories] = useState([]);
  const [thresholds, setThresholds] = useState([]); // Danh sách ngưỡng để chọn badge
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: 0,
    image: '',
    description: '',
    is_available: true,
    // Badge settings
    badgeType: 'auto', // 'auto', 'manual', 'none'
    manual_badge: null, // { threshold_id: '', label: '', icon: '', color: '' }
    use_auto_badge: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingFoodId, setDeletingFoodId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchFood();
    fetchThresholds();
  }, [categoryFilter, availabilityFilter, pagination.page]);

  const fetchThresholds = async () => {
    try {
      const res = await fetch('/api/config/popular?sortBy=order');
      const data = await res.json();
      if (data.success) {
        setThresholds(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching thresholds:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesRes = await fetch('/api/categories');
      const categoriesData = await categoriesRes.json();
      if (categoriesData.success) {
        setCategories(categoriesData.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFood = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (categoryFilter !== 'all') {
        params.append('category_id', categoryFilter);
      }

      if (availabilityFilter !== 'all') {
        params.append('is_available', availabilityFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const foodRes = await fetch(`/api/food?${params}`);
      const foodData = await foodRes.json();

      if (foodData.success) {
        setFood(foodData.data);
        setPagination(prev => ({
          ...prev,
          total: foodData.pagination?.total || 0,
          totalPages: foodData.pagination?.totalPages || 0,
        }));
      } else {
        setError('Lỗi khi tải dữ liệu');
      }
    } catch (error) {
      console.error('Error fetching food:', error);
      setError('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchFood();
  };

  const handleOpenModal = (foodItem = null) => {
    if (foodItem) {
      setEditingFood(foodItem);
      // Xác định badgeType dựa trên manual_badge
      let badgeType = 'auto';
      if (foodItem.manual_badge) {
        badgeType = 'manual';
      } else if (foodItem.use_auto_badge === false) {
        badgeType = 'none';
      }
      
      setFormData({
        name: foodItem.name || '',
        category_id: foodItem.category_id || '',
        price: foodItem.price || 0,
        image: foodItem.image || '',
        description: foodItem.description || '',
        is_available: foodItem.is_available !== undefined ? foodItem.is_available : true,
        badgeType,
        manual_badge: foodItem.manual_badge || null,
        use_auto_badge: foodItem.use_auto_badge !== undefined ? foodItem.use_auto_badge : true,
      });
    } else {
      setEditingFood(null);
      setFormData({
        name: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        price: 0,
        image: '',
        description: '',
        is_available: true,
        badgeType: 'auto',
        manual_badge: null,
        use_auto_badge: true,
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFood(null);
    setFormData({
      name: '',
      category_id: '',
      price: 0,
      image: '',
      description: '',
      is_available: true,
      badgeType: 'auto',
      manual_badge: null,
      use_auto_badge: true,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Tên món là bắt buộc');
      return;
    }

    if (!formData.category_id) {
      setError('Danh mục là bắt buộc');
      return;
    }

    if (!formData.price || formData.price < 0) {
      setError('Giá phải lớn hơn 0');
      return;
    }

    try {
      const url = editingFood
        ? `/api/food/${editingFood.id}`
        : '/api/food';
      const method = editingFood ? 'PUT' : 'POST';

      // Xử lý badge settings
      let badgeData = {};
      if (formData.badgeType === 'manual') {
        // Nếu chọn manual, set manual_badge và use_auto_badge
        if (formData.manual_badge) {
          badgeData.manual_badge = formData.manual_badge;
        }
        badgeData.use_auto_badge = false; // Tắt auto khi dùng manual
      } else if (formData.badgeType === 'none') {
        // Nếu chọn none, xóa manual_badge và tắt auto
        badgeData.manual_badge = null;
        badgeData.use_auto_badge = false;
      } else {
        // Nếu chọn auto, xóa manual_badge và bật auto
        badgeData.manual_badge = null;
        badgeData.use_auto_badge = true;
      }

      const submitData = {
        name: formData.name,
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        image: formData.image || '',
        description: formData.description || '',
        is_available: formData.is_available,
        ...badgeData,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(editingFood ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        fetchFood();
        setTimeout(() => {
          handleCloseModal();
        }, 1000);
      } else {
        setError(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving food:', error);
      setError('Lỗi khi lưu món ăn');
    }
  };

  const handleDelete = (id) => {
    setDeletingFoodId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFoodId) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/food/${deletingFoodId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Xóa thành công!');
        fetchFood();
        setShowDeleteModal(false);
        setDeletingFoodId(null);
      } else {
        setError(data.error || 'Không thể xóa món ăn');
      }
    } catch (error) {
      console.error('Error deleting food:', error);
      setError('Lỗi khi xóa món ăn');
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'N/A';
  };

  // Helper function để tính badge cho food (Kết hợp Tự động + Thủ công)
  const getBadgeForFood = (foodItem) => {
    // Bước 1: Kiểm tra manual_badge (Ưu tiên cao nhất)
    if (foodItem.manual_badge) {
      // Nếu có threshold_id → lấy badge từ ngưỡng đó
      if (foodItem.manual_badge.threshold_id) {
        const threshold = thresholds.find(t => t._id === foodItem.manual_badge.threshold_id)
        if (threshold) {
          return {
            ...threshold,
            isManual: true
          }
        }
      }
      // Nếu không có threshold_id → dùng badge tùy chỉnh
      if (foodItem.manual_badge.label && foodItem.manual_badge.icon && foodItem.manual_badge.color) {
        return {
          label: foodItem.manual_badge.label,
          icon: foodItem.manual_badge.icon,
          color: foodItem.manual_badge.color,
          isManual: true
        }
      }
    }
    
    // Bước 2: Hệ thống tự động (Fallback) - Trong admin không có popularFoodsMap nên chỉ hiển thị manual
    // Nếu use_auto_badge === false → không có badge
    if (foodItem.use_auto_badge === false) {
      return null
    }
    
    // Trong admin, không tính auto badge (cần popularFoodsMap)
    // Chỉ hiển thị "Tự động" indicator
    return { isAuto: true }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="w-7 h-7 text-primary" />
          <h1 className="text-2xl lg:text-3xl font-bold text-card-foreground">Quản lý Món ăn</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm món ăn</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-success/10 border border-success/50 text-success px-4 py-3 rounded-lg">
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
              placeholder="Tìm theo tên, mô tả..."
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

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="pl-10 pr-8 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Availability Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={availabilityFilter}
              onChange={(e) => {
                setAvailabilityFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="pl-10 pr-8 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="all">Tất cả</option>
              <option value="true">Có sẵn</option>
              <option value="false">Hết hàng</option>
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
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tên món
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Hình ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Badge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {food.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-muted-foreground">
                    {searchTerm || categoryFilter !== 'all' || availabilityFilter !== 'all' ? 'Không tìm thấy món ăn' : 'Chưa có món ăn nào'}
                  </td>
                </tr>
              ) : (
                food.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {getCategoryName(item.category_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = '/placeholder.png';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const badge = getBadgeForFood(item)
                        if (badge && badge.isAuto) {
                          return (
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-500 rounded-full">
                              Tự động
                            </span>
                          )
                        } else if (badge && badge.isManual) {
                          return (
                            <div
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
                              style={{
                                backgroundColor: `${badge.color}30`,
                                color: badge.color,
                              }}
                            >
                              <span>{badge.icon}</span>
                              <span>{badge.label}</span>
                              <span className="text-[10px] text-yellow-500">(Thủ công)</span>
                            </div>
                          )
                        }
                        return <span className="text-xs text-muted-foreground">-</span>
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                          item.is_available
                            ? 'bg-success/20 text-success'
                            : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {item.is_available ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {item.is_available ? 'Có sẵn' : 'Hết hàng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="flex items-center gap-1 text-primary hover:text-primary-light transition-colors cursor-pointer"
                          aria-label="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center gap-1 text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                          aria-label="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {food.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter !== 'all' || availabilityFilter !== 'all' ? 'Không tìm thấy món ăn' : 'Chưa có món ăn nào'}
            </p>
          </div>
        ) : (
          food.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-lg border border-border p-4 space-y-3"
            >
              <div className="flex items-start gap-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded shrink-0"
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded flex items-center justify-center shrink-0">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-card-foreground truncate">{item.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full shrink-0 ${
                        item.is_available
                          ? 'bg-success/20 text-success'
                          : 'bg-destructive/20 text-destructive'
                      }`}
                    >
                      {item.is_available ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {item.is_available ? 'Có sẵn' : 'Hết hàng'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {getCategoryName(item.category_id)}
                  </p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(item.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors font-medium cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          ))
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

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-card rounded-lg max-w-2xl w-full p-6 border border-border max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-card-foreground">
                {editingFood ? 'Sửa món ăn' : 'Thêm món ăn mới'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Tên món <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Danh mục <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Giá (VNĐ) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  URL hình ảnh
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
                  placeholder="Mô tả về món ăn..."
                />
              </div>

              {/* Badge Settings */}
              <div className="border-t border-border pt-4">
                <label className="block text-sm font-medium text-card-foreground mb-3">
                  Cài đặt Badge
                </label>
                <div className="space-y-4">
                  {/* Radio buttons cho badge type */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="badgeType"
                        value="auto"
                        checked={formData.badgeType === 'auto'}
                        onChange={(e) => setFormData({ ...formData, badgeType: e.target.value, manual_badge: null })}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-card-foreground">Tự động (dựa trên số lượng đặt)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="badgeType"
                        value="manual"
                        checked={formData.badgeType === 'manual'}
                        onChange={(e) => {
                          setFormData({ 
                            ...formData, 
                            badgeType: e.target.value,
                            manual_badge: formData.manual_badge || { threshold_id: '', label: '', icon: '', color: '#FF0000' }
                          })
                        }}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-card-foreground">Thủ công (admin gắn)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="badgeType"
                        value="none"
                        checked={formData.badgeType === 'none'}
                        onChange={(e) => setFormData({ ...formData, badgeType: e.target.value, manual_badge: null })}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-card-foreground">Không có badge</span>
                    </label>
                  </div>

                  {/* Manual badge settings */}
                  {formData.badgeType === 'manual' && (
                    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                          Chọn từ ngưỡng có sẵn
                        </label>
                        <select
                          value={formData.manual_badge?.threshold_id || ''}
                          onChange={(e) => {
                            const thresholdId = e.target.value
                            if (thresholdId) {
                              const threshold = thresholds.find(t => t._id === thresholdId)
                              if (threshold) {
                                setFormData({
                                  ...formData,
                                  manual_badge: { threshold_id: thresholdId, label: '', icon: '', color: '' }
                                })
                              }
                            } else {
                              setFormData({
                                ...formData,
                                manual_badge: { threshold_id: '', label: formData.manual_badge?.label || '', icon: formData.manual_badge?.icon || '', color: formData.manual_badge?.color || '#FF0000' }
                              })
                            }
                          }}
                          className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Tùy chỉnh badge</option>
                          {thresholds.map((threshold) => (
                            <option key={threshold._id} value={threshold._id}>
                              {threshold.icon} {threshold.label} (≥{threshold.value})
                            </option>
                          ))}
                        </select>
                      </div>

                      {(!formData.manual_badge?.threshold_id) && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-card-foreground mb-2">
                              Label <span className="text-destructive">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.manual_badge?.label || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                manual_badge: { ...formData.manual_badge, label: e.target.value, threshold_id: '', icon: formData.manual_badge?.icon || '', color: formData.manual_badge?.color || '#FF0000' }
                              })}
                              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              placeholder="Ví dụ: Món mới"
                              required={!formData.manual_badge?.threshold_id}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-card-foreground mb-2">
                              Icon (Emoji) <span className="text-destructive">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.manual_badge?.icon || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                manual_badge: { ...formData.manual_badge, icon: e.target.value, threshold_id: '', label: formData.manual_badge?.label || '', color: formData.manual_badge?.color || '#FF0000' }
                              })}
                              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              placeholder="🔥"
                              required={!formData.manual_badge?.threshold_id}
                            />
                            <p className="text-sm text-muted-foreground">Ví dụ: 🔥, ⭐, ⚡, 🏆, 👑, 💎, ❤️, ✨, 🚀</p>
                            <p className="text-sm text-muted-foreground"> Truy cập <a href="https://emojipedia.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">emojipedia.org</a> để tìm emoji</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-card-foreground mb-2">
                              Màu sắc (Hex) <span className="text-destructive">*</span>
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={formData.manual_badge?.color || '#FF0000'}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  manual_badge: { ...formData.manual_badge, color: e.target.value, threshold_id: '', label: formData.manual_badge?.label || '', icon: formData.manual_badge?.icon || '' }
                                })}
                                className="w-16 h-10 rounded border border-border cursor-pointer"
                              />
                              <input
                                type="text"
                                value={formData.manual_badge?.color || '#FF0000'}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  manual_badge: { ...formData.manual_badge, color: e.target.value, threshold_id: '', label: formData.manual_badge?.label || '', icon: formData.manual_badge?.icon || '' }
                                })}
                                className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="#FF0000"
                                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                required={!formData.manual_badge?.threshold_id}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Preview badge */}
                      {formData.manual_badge && (
                        <div className="pt-4 border-t border-border">
                          <label className="block text-sm font-medium text-card-foreground mb-2">
                            Preview Badge
                          </label>
                          <div className="flex items-center gap-2">
                            {(() => {
                              let badge = null
                              if (formData.manual_badge.threshold_id) {
                                const threshold = thresholds.find(t => t._id === formData.manual_badge.threshold_id)
                                if (threshold) badge = threshold
                              } else if (formData.manual_badge.label && formData.manual_badge.icon && formData.manual_badge.color) {
                                badge = formData.manual_badge
                              }
                              
                              if (badge) {
                                return (
                                  <div
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border backdrop-blur-sm"
                                    style={{
                                      backgroundColor: `${badge.color}50`,
                                      borderColor: `${badge.color}50`,
                                    }}
                                  >
                                    <span className="text-base">{badge.icon}</span>
                                    <span className="text-xs font-semibold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                      {badge.label}
                                    </span>
                                  </div>
                                )
                              }
                              return <span className="text-sm text-muted-foreground">Chưa có badge</span>
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-card-foreground">Món đang bán</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium cursor-pointer"
                >
                  {editingFood ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowDeleteModal(false);
            setDeletingFoodId(null);
          }}
        >
          <div 
            className="bg-card rounded-lg max-w-md w-full p-6 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-card-foreground mb-4">Xác nhận xóa</h2>
            <p className="text-card-foreground mb-6">
              Bạn có chắc chắn muốn xóa món ăn{' '}
              <span className="font-bold">
                {deletingFoodId && food.find(f => (f.id === deletingFoodId || f._id === deletingFoodId))?.name}
              </span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingFoodId(null);
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

