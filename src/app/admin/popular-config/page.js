'use client';

import { useState, useEffect, useRef } from 'react';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import Toast from '@/components/Toast/Toast';
import { TrendingUp, Plus, Edit2, Trash2, Loader2, X, ArrowUp, ArrowDown, Eye, Settings } from 'lucide-react';
import { adminFetch } from '@/lib/adminAuth';

export default function AdminPopularConfig() {
  // Check if user has permission (only admin and super_admin)
  const { isAuthorized, isChecking } = useRoleCheck(['admin', 'super_admin']);

  const [thresholds, setThresholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showValue, setShowValue] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
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
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await adminFetch('/api/config/popular/settings');
      const data = await res.json();
      if (data.success) {
        setShowValue(data.data.show_value !== false);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleToggleShowValue = async () => {
    const newValue = !showValue;
    setSavingSettings(true);
    try {
      const res = await adminFetch('/api/config/popular/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_value: newValue }),
      });
      const data = await res.json();
      if (data.success) {
        setShowValue(newValue);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Cập nhật cài đặt thành công!', type: 'success' },
            })
          );
        }
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Lỗi khi cập nhật cài đặt', type: 'error' },
            })
          );
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi cập nhật cài đặt', type: 'error' },
          })
        );
      }
    } finally {
      setSavingSettings(false);
    }
  };

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

  // Handle click outside for all modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if saving
      if (saving || deleting) return;

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

    const isAnyModalOpen = showModal || showDeleteModal;

    if (isAnyModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal, showDeleteModal, saving, deleting]);

  // Handle scroll lock when any modal is open
  useEffect(() => {
    const isAnyModalOpen = showModal || showDeleteModal;

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, showDeleteModal]);

  const fetchThresholds = async () => {
    try {
      setLoading(true);
      const res = await adminFetch('/api/config/popular?sortBy=order');
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

    if (formData.value < 0) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Value phải >= 0', type: 'error' },
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

      const res = await adminFetch(url, {
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
        handleCloseModal();
        fetchThresholds();
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
      const res = await adminFetch(`/api/config/popular/${deletingThresholdId}`, {
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
      const responses = await Promise.all([
        adminFetch(`/api/config/popular/${current._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...current, order: newOrder }),
        }),
        adminFetch(`/api/config/popular/${target._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...target, order: oldOrder }),
        }),
      ]);

      // Check if both requests succeeded
      const results = await Promise.all(responses.map(res => res.json()));
      const hasError = results.some(data => !data.success);

      if (hasError) {
        const errorMessage = results.find(data => !data.success)?.error || 'Lỗi khi sắp xếp lại thứ tự';
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: errorMessage, type: 'error' },
            })
          );
        }
        return;
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Đã cập nhật thứ tự thành công!', type: 'success' },
          })
        );
      }
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
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast({ message: '', isVisible: false })}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <TrendingUp className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-card-foreground">Cấu hình Ngưỡng Món Nổi Bật</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all font-semibold shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm ngưỡng mới</span>
        </button>
      </div>

      {/* Settings Section */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-card-foreground mb-5 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Cài đặt hiển thị
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/40 rounded-xl border border-border/50 gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-card-foreground mb-1">
              Hiển thị giá trị ngưỡng
            </label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bật để hiển thị giá trị (ví dụ: ≥10) bên cạnh nhãn trên giao diện người dùng. Hữu ích để người dùng biết tại sao sản phẩm đạt danh hiệu này.
            </p>
          </div>
          <button
            onClick={handleToggleShowValue}
            disabled={savingSettings}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${showValue ? 'bg-primary shadow-inner shadow-primary-dark/20' : 'bg-muted-foreground/30'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${showValue ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
      </div>

      {/* Testing Section */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          Xem trước & Kiểm tra
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Nhập số lượng bán để test
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
              placeholder="Ví dụ: 25"
              className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <button
            onClick={handleTestQuantity}
            className="sm:self-end h-[46px] px-8 bg-muted hover:bg-muted-foreground/10 text-foreground rounded-xl transition-all font-bold border border-border active:scale-95 cursor-pointer"
          >
            Kiểm tra
          </button>
        </div>
        {testResult && (
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-muted-foreground mb-3 font-medium">
              Với số lượng <span className="text-primary font-bold px-1.5 py-0.5 bg-primary/10 rounded-md">{testQuantity}</span>, món ăn sẽ hiển thị:
            </p>
            <div className="flex items-center gap-4">
              <div
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-base font-bold text-white shadow-lg"
                style={getPreviewStyle(testResult)}
              >
                <span className="text-xl leading-none">{testResult.icon}</span>
                <span>{testResult.label}</span>
              </div>
              <div className="hidden sm:block h-8 w-px bg-border/50 mx-2" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-card-foreground">Thông tin ngưỡng:</p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase">
                  Value: {testResult.value} | Color: {testResult.color}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Thresholds List */}
      {thresholds.length === 0 ? (
        <div className="bg-card rounded-2xl border-2 border-dashed border-border p-12 text-center transition-all hover:border-primary/30">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-card-foreground mb-2">
            Chưa có ngưỡng nào
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Hãy thêm ngưỡng đầu tiên để bắt đầu cấu hình các danh hiệu tự động cho món ăn nổi bật.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all font-semibold shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm ngưỡng đầu tiên</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-card-foreground flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Danh sách ngưỡng ({thresholds.length})
            </h3>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Sắp xếp theo thứ tự ưu tiên (cao nhất lên trên)
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Preview</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Tên nhãn</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Số lượng tối thiểu</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Icon & Màu</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Thứ tự</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {thresholds.map((threshold, index) => (
                  <tr key={threshold._id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
                        style={getPreviewStyle(threshold)}
                      >
                        <span className="text-base">{threshold.icon}</span>
                        <span>{threshold.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-card-foreground">
                      {threshold.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2.5 py-1 bg-muted rounded-lg text-sm font-mono font-bold">
                        ≥ {threshold.value}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-xl bg-muted w-10 h-10 flex items-center justify-center rounded-lg border border-border">{threshold.icon}</span>
                        <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-lg border border-border">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: threshold.color }} />
                          <span className="text-[10px] font-mono font-bold">{threshold.color}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-muted-foreground">
                      {threshold.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleMoveOrder(threshold._id, 'up')}
                          disabled={index === 0}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-30 cursor-pointer"
                          title="Lên"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(threshold._id, 'down')}
                          disabled={index === thresholds.length - 1}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-30 cursor-pointer"
                          title="Xuống"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <button
                          onClick={() => handleOpenModal(threshold)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all cursor-pointer"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(threshold._id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer"
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

          {/* Mobile Card View */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {thresholds.map((threshold, index) => (
              <div key={threshold._id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
                    style={getPreviewStyle(threshold)}
                  >
                    <span className="text-base">{threshold.icon}</span>
                    <span>{threshold.label}</span>
                  </div>
                  <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                    <button
                      onClick={() => handleMoveOrder(threshold._id, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-muted-foreground hover:text-primary disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(threshold._id, 'down')}
                      disabled={index === thresholds.length - 1}
                      className="p-1.5 text-muted-foreground hover:text-primary disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Số lượng bán</p>
                    <p className="text-sm font-bold text-card-foreground">≥ {threshold.value}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Thứ tự</p>
                    <p className="text-sm font-bold text-card-foreground">Ưu tiên {threshold.order}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Màu sắc</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full shadow-xs" style={{ backgroundColor: threshold.color }} />
                      <span className="text-[10px] font-mono font-bold text-card-foreground">{threshold.color}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Biểu tượng</p>
                    <span className="text-lg leading-none">{threshold.icon}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleOpenModal(threshold)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500/10 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(threshold._id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-destructive/10 text-destructive rounded-xl text-sm font-bold hover:bg-destructive/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
          <div
            ref={modalRef}
            className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="sticky top-0 bg-card/80 backdrop-blur-md border-b border-border px-6 py-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-card-foreground">
                  {editingThreshold ? 'Sửa cấu hình ngưỡng' : 'Thêm ngưỡng mới'}
                </h2>
              </div>
              <button
                onClick={() => {
                  if (saving) return;
                  handleCloseModal();
                }}
                disabled={saving}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Preview Badge Highlight */}
              <div className="bg-muted/30 border border-border/50 rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Xem trước hiển thị
                </label>
                <div
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-lg font-bold text-white shadow-xl shadow-primary/10 transition-all scale-110 mb-2"
                  style={getPreviewStyle(formData)}
                >
                  <span className="text-2xl leading-none">{formData.icon}</span>
                  <span>{formData.label || 'Danh hiệu'}</span>
                </div>
                <p className="text-[10px] text-muted-foreground max-w-[200px]">
                  Đây là cách badge này sẽ xuất hiện trên trang danh sách món ăn.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Label */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-card-foreground mb-1.5 flex items-center gap-1.5">
                    Tên nhãn hiển thị <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Ví dụ: 🔥 Siêu Bán Chạy, ⭐ Top Đánh Giá..."
                    className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">Tên ngắn gọn, súc tích sẽ hiển thị tốt hơn trên mobile.</p>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-sm font-bold text-card-foreground mb-1.5">
                    Số lượng tối thiểu <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">≥</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                      className="w-full pl-8 pr-4 py-3 bg-muted/40 border border-border rounded-xl text-card-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                      required
                    />
                  </div>
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-bold text-card-foreground mb-1.5">
                    Thứ tự ưu tiên
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-card-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-bold text-card-foreground mb-1.5">
                    Biểu tượng (Emoji) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🔥, ⭐, ⚡..."
                    className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-card-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all text-xl"
                    required
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground flex items-center gap-1">
                    Tìm emoji tại <a href="https://emojipedia.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">emojipedia.org</a>
                  </p>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-bold text-card-foreground mb-1.5">
                    Màu sắc chủ đạo <span className="text-destructive">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative w-12 h-12 shrink-0">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-full h-full rounded-xl border-2 border-border shadow-sm" style={{ backgroundColor: formData.color }} />
                    </div>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#FF0000"
                      className="flex-1 px-4 py-3 bg-muted/40 border border-border rounded-xl text-card-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono uppercase text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="flex-1 py-3 bg-muted hover:bg-muted-foreground/10 text-foreground rounded-xl transition-all font-bold active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all font-bold shadow-lg shadow-primary/20 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      {editingThreshold ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{editingThreshold ? 'Cập nhật ngưỡng' : 'Tạo ngưỡng mới'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
          <div
            ref={deleteModalRef}
            className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-destructive/5 shadow-xl">
                <Trash2 className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-card-foreground mb-3">
                Xác nhận xóa ngưỡng?
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Hành động này không thể hoàn tác. Món ăn đạt số lượng này sẽ không còn được gán danh hiệu tự động nữa.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingThresholdId(null);
                  }}
                  className="flex-1 py-3 bg-muted hover:bg-muted-foreground/10 text-foreground rounded-xl transition-all font-bold active:scale-95 cursor-pointer"
                  disabled={deleting}
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 py-3 bg-destructive hover:bg-destructive/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-destructive/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Xác nhận xóa</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

