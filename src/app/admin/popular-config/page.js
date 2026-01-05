'use client';

import { useState, useEffect, useRef } from 'react';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import Toast from '@/components/Toast/Toast';
import { TrendingUp, Plus, Edit2, Trash2, Loader2, X, ArrowUp, ArrowDown, Eye } from 'lucide-react';

export default function AdminPopularConfig() {
  // Check if user has permission (only admin and super_admin)
  const { isAuthorized, isChecking } = useRoleCheck(['admin', 'super_admin']);

  const [thresholds, setThresholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    value: 1,
    icon: '🔥',
    color: '#FF0000',
    order: 1,
  });
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingThresholdId, setDeletingThresholdId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [testQuantity, setTestQuantity] = useState('');
  const [testResult, setTestResult] = useState(null);
  const modalRef = useRef(null);
  const deleteModalRef = useRef(null);

  useEffect(() => {
    fetchThresholds();
  }, []);

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

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showModal && modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
        setEditingThreshold(null);
        setFormData({
          label: '',
          value: 1,
          icon: '🔥',
          color: '#FF0000',
          order: 1,
        });
      }
      if (showDeleteModal && deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowDeleteModal(false);
        setDeletingThresholdId(null);
      }
    };

    if (showModal || showDeleteModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showModal, showDeleteModal]);

  const fetchThresholds = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/config/popular?sortBy=order');
      const data = await res.json();
      if (data.success) {
        setThresholds(data.data || []);
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Lỗi khi tải danh sách ngưỡng', type: 'error' },
            })
          );
        }
      }
    } catch (error) {
      console.error('Error fetching thresholds:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi tải danh sách ngưỡng', type: 'error' },
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (threshold = null) => {
    if (threshold) {
      setEditingThreshold(threshold);
      setFormData({
        label: threshold.label || '',
        value: threshold.value || 1,
        icon: threshold.icon || '🔥',
        color: threshold.color || '#FF0000',
        order: threshold.order || 1,
      });
    } else {
      setEditingThreshold(null);
      const maxOrder = thresholds.length > 0 
        ? Math.max(...thresholds.map(t => t.order || 0)) 
        : 0;
      setFormData({
        label: '',
        value: 1,
        icon: '🔥',
        color: '#FF0000',
        order: maxOrder + 1,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingThreshold(null);
    setFormData({
      label: '',
      value: 1,
      icon: '🔥',
      color: '#FF0000',
      order: 1,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.label.trim()) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Label là bắt buộc', type: 'error' },
          })
        );
      }
      return;
    }

    if (formData.value < 1) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Value phải >= 1', type: 'error' },
          })
        );
      }
      return;
    }

    if (!formData.icon.trim()) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Icon là bắt buộc', type: 'error' },
          })
        );
      }
      return;
    }

    if (!formData.color.trim() || !formData.color.startsWith('#')) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Color phải là mã hex hợp lệ (ví dụ: #FF0000)', type: 'error' },
          })
        );
      }
      return;
    }

    setSaving(true);
    try {
      const url = editingThreshold
        ? `/api/config/popular/${editingThreshold._id}`
        : '/api/config/popular';
      const method = editingThreshold ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: editingThreshold ? 'Cập nhật thành công!' : 'Thêm mới thành công!', type: 'success' },
            })
          );
        }
        fetchThresholds();
        setTimeout(() => {
          handleCloseModal();
        }, 1000);
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || data.errors?.join(', ') || 'Có lỗi xảy ra', type: 'error' },
            })
          );
        }
      }
    } catch (error) {
      console.error('Error saving threshold:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi lưu ngưỡng', type: 'error' },
          })
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    setDeletingThresholdId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingThresholdId) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/config/popular/${deletingThresholdId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Xóa thành công!', type: 'success' },
            })
          );
        }
        fetchThresholds();
        setShowDeleteModal(false);
        setDeletingThresholdId(null);
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Không thể xóa ngưỡng', type: 'error' },
            })
          );
        }
      }
    } catch (error) {
      console.error('Error deleting threshold:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi xóa ngưỡng', type: 'error' },
          })
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleMoveOrder = async (id, direction) => {
    const currentIndex = thresholds.findIndex(t => t._id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= thresholds.length) return;

    // Swap order values
    const current = thresholds[currentIndex];
    const target = thresholds[newIndex];
    
    const newOrder = target.order;
    const oldOrder = current.order;

    try {
      // Update both thresholds
      await Promise.all([
        fetch(`/api/config/popular/${current._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...current, order: newOrder }),
        }),
        fetch(`/api/config/popular/${target._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...target, order: oldOrder }),
        }),
      ]);

      fetchThresholds();
    } catch (error) {
      console.error('Error moving order:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi sắp xếp lại thứ tự', type: 'error' },
          })
        );
      }
    }
  };

  const handleTestQuantity = () => {
    const quantity = parseInt(testQuantity);
    if (isNaN(quantity) || quantity < 0) {
      setTestResult(null);
      return;
    }

    // Sort thresholds by value descending
    const sorted = [...thresholds].sort((a, b) => b.value - a.value);
    const matched = sorted.find(t => quantity >= t.value);
    setTestResult(matched || null);
  };

  // Preview badge style
  const getPreviewStyle = (threshold) => ({
    backgroundColor: threshold.color,
    borderColor: `${threshold.color}80`,
    boxShadow: `0 10px 15px -3px ${threshold.color}50, 0 4px 6px -2px ${threshold.color}30`,
  });

  // Show loading while checking auth or fetching data
  if (isChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-muted-foreground">Đang tải...</div>
        </div>
      </div>
    );
  }

  // Don't render if not authorized
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-primary" />
          <h1 className="text-2xl lg:text-3xl font-bold text-card-foreground">Cấu hình Ngưỡng Món Nổi Bật</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm ngưỡng</span>
        </button>
      </div>

      {/* Testing Section */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Preview & Testing
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Số lượng test
            </label>
            <input
              type="number"
              min="0"
              value={testQuantity}
              onChange={(e) => {
                setTestQuantity(e.target.value);
                setTestResult(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleTestQuantity()}
              placeholder="Nhập số lượng để xem badge nào sẽ hiển thị"
              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={handleTestQuantity}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium whitespace-nowrap cursor-pointer"
          >
            Test
          </button>
        </div>
        {testResult && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Với số lượng <strong className="text-card-foreground">{testQuantity}</strong>, sẽ hiển thị badge:
            </p>
            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold text-white"
              style={getPreviewStyle(testResult)}
            >
              <span className="text-base">{testResult.icon}</span>
              <span>{testResult.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ngưỡng: {testResult.value} | Màu: {testResult.color}
            </p>
          </div>
        )}
      </div>

      {/* Thresholds List */}
      {thresholds.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Chưa có ngưỡng nào
          </h3>
          <p className="text-muted-foreground mb-4">
            Hãy thêm ngưỡng đầu tiên để bắt đầu cấu hình
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm ngưỡng đầu tiên</span>
          </button>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Label
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Icon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {thresholds.map((threshold, index) => (
                  <tr key={threshold._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold text-white"
                        style={getPreviewStyle(threshold)}
                      >
                        <span className="text-sm">{threshold.icon}</span>
                        <span className="hidden sm:inline">{threshold.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                      {threshold.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {threshold.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {threshold.icon}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded border border-border"
                          style={{ backgroundColor: threshold.color }}
                        />
                        <span className="text-sm text-muted-foreground font-mono">
                          {threshold.color}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {threshold.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleMoveOrder(threshold._id, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          title="Lên"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(threshold._id, 'down')}
                          disabled={index === thresholds.length - 1}
                          className="p-1.5 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          title="Xuống"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(threshold)}
                          className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded transition-colors cursor-pointer"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(threshold._id)}
                          className="p-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer"
                          title="Xóa"
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
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-card-foreground">
                {editingThreshold ? 'Sửa ngưỡng' : 'Thêm ngưỡng mới'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Preview Badge */}
              <div className="bg-muted rounded-lg p-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Preview Badge
                </label>
                <div
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold text-white"
                  style={getPreviewStyle(formData)}
                >
                  <span className="text-base">{formData.icon}</span>
                  <span>{formData.label || 'Label'}</span>
                </div>
              </div>

              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Label <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Ví dụ: Bán chạy, Nổi bật, Phổ biến"
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Value (Số lượng tối thiểu) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Icon (Emoji) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🔥, ⭐, ⚡, 🏆, 👑, 💎, ..."
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-2xl"
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Nhập emoji (ví dụ: 🔥, ⭐, ⚡, 🏆, 👑, 💎, ❤️, ✨, 🚀)
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Truy cập <a href="https://emojipedia.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">emojipedia.org</a> để tìm emoji
                </p>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Color (Hex) <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10 bg-input border border-border rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#FF0000"
                    className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Mã màu hex (ví dụ: #FF0000, #0066FF, #92ae2d)
                </p>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Order (Thứ tự hiển thị)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Số nhỏ hơn = hiển thị trước (1 = cao nhất)
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    editingThreshold ? 'Cập nhật' : 'Thêm mới'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div ref={deleteModalRef} className="bg-card rounded-lg border border-border w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-card-foreground mb-4">
                Xác nhận xóa
              </h2>
              <p className="text-muted-foreground mb-6">
                Bạn có chắc muốn xóa ngưỡng này? Món ăn sẽ không còn hiển thị badge này nữa.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingThresholdId(null);
                  }}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium cursor-pointer"
                  disabled={deleting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    'Xóa'
                  )}
                </button>
              </div>
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

