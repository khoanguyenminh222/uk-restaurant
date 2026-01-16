export const runtime = 'edge';

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast/Toast';
import { UserPlus, X, Mail, Phone, User, Shield, ShieldCheck, Loader2, Edit2, Trash2, Search, Filter, ChevronDown, Eye } from 'lucide-react';
import { adminFetch } from '@/lib/adminAuth';

export default function AdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    address: '',
    role: 'admin',
  });
  const [currentAdmin, setCurrentAdmin] = useState(null); // Current logged-in admin
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Check auth state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    role: 'admin', // Default role
  });
  const [formErrors, setFormErrors] = useState({});

  // Refs for modals
  const createModalRef = useRef(null);
  const editModalRef = useRef(null);
  const deleteModalRef = useRef(null);

  // Check if user is super_admin, redirect if not
  useEffect(() => {
    try {
      const adminData = localStorage.getItem('admin_data');
      if (adminData) {
        const admin = JSON.parse(adminData);
        // Only super_admin can access this page
        if (admin.role !== 'super_admin') {
          router.push('/admin/dashboard');
          return;
        }
        setCurrentAdmin(admin);
        setIsCheckingAuth(false);
      } else {
        // No admin data, redirect to login
        router.push('/admin');
      }
    } catch (e) {
      console.error('Error checking admin role:', e);
      router.push('/admin');
    }
  }, [router]);

  useEffect(() => {
    // Only fetch if currentAdmin is set and is super_admin
    if (currentAdmin && currentAdmin.role === 'super_admin') {
      fetchAdmins();
    }
  }, [roleFilter, pagination.page, currentAdmin]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if any action is in progress
      if (creating || editing || deleting) return;

      if (showCreateForm && createModalRef.current && !createModalRef.current.contains(event.target)) {
        setShowCreateForm(false);
        setFormData({
          phone: '',
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          address: '',
          role: 'admin',
        });
        setFormErrors({});
      }
      if (showEditModal && editModalRef.current && !editModalRef.current.contains(event.target)) {
        setShowEditModal(false);
        setEditingAdmin(null);
        setEditFormData({ name: '', email: '', address: '', role: 'admin' });
      }
      if (showDeleteModal && deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowDeleteModal(false);
        setEditingAdmin(null);
      }
    };

    if (showCreateForm || showEditModal || showDeleteModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showCreateForm, showEditModal, showDeleteModal, creating, editing, deleting]);

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

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await adminFetch(`/api/admin/admins?${params}`);
      const data = await response.json();

      if (data.success) {
        setAdmins(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Không thể tải danh sách admin', type: 'error' },
            })
          );
        }
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi tải danh sách admin', type: 'error' },
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearching(true);
    try {
      await fetchAdmins();
    } finally {
      setSearching(false);
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setEditFormData({
      name: admin.name || '',
      email: admin.email || '',
      address: admin.address || '',
      role: admin.role || 'admin',
    });
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return;

    setEditing(true);
    try {
      const response = await adminFetch(`/api/admin/admins/${editingAdmin.user_id || editingAdmin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Đã cập nhật thông tin admin thành công!', type: 'success' },
            })
          );
        }
        fetchAdmins();
        setShowEditModal(false);
        setEditingAdmin(null);
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Không thể cập nhật thông tin admin', type: 'error' },
            })
          );
        }
      }
    } catch (err) {
      console.error('Error updating admin:', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi cập nhật admin', type: 'error' },
          })
        );
      }
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = (admin) => {
    setEditingAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingAdmin) return;

    setDeleting(true);
    try {
      const response = await adminFetch(`/api/admin/admins/${editingAdmin.user_id || editingAdmin._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Đã xóa admin thành công!', type: 'success' },
            })
          );
        }
        fetchAdmins();
        setShowDeleteModal(false);
        setEditingAdmin(null);
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Không thể xóa admin', type: 'error' },
            })
          );
        }
      }
    } catch (err) {
      console.error('Error deleting admin:', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi xóa admin', type: 'error' },
          })
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.name.trim()) {
      errors.name = 'Tên là bắt buộc';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu không khớp';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setCreating(true);
    try {
      const response = await adminFetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone.replace(/\s+/g, ''),
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          address: formData.address.trim() || '',
          role: formData.role, // Send role
          currentAdminPhone: currentAdmin?.phone, // Send current admin phone for auth check
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.message || 'Đã tạo tài khoản admin thành công', type: 'success' },
            })
          );
        }
        setFormData({
          phone: '',
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          address: '',
          role: 'admin',
        });
        setShowCreateForm(false);
        fetchAdmins(); // Refresh list
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Không thể tạo tài khoản admin', type: 'error' },
            })
          );
        }
      }
    } catch (err) {
      console.error('Error creating admin:', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi kết nối. Vui lòng thử lại sau.', type: 'error' },
          })
        );
      }
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // No longer returning centered loader here as we use skeletons
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render anything if not super_admin (will be redirected)
  if (!currentAdmin || currentAdmin.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-card-foreground flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            Quản lý Admin
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Danh sách tài khoản quản trị hệ thống</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
        >
          <UserPlus className="w-5 h-5" />
          <span>Tạo Admin mới</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, email..."
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

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="pl-10 pr-8 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="all">Tất cả</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Create Admin Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div ref={createModalRef} className="relative w-full max-w-md bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
            <button
              onClick={() => {
                if (creating) return;
                setShowCreateForm(false);
                setFormData({
                  phone: '',
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  address: '',
                  role: 'admin',
                });
                setFormErrors({});
              }}
              disabled={creating}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors z-10 cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Tạo tài khoản Admin mới
              </h2>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Số điện thoại <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0901234567"
                      className={`w-full pl-10 pr-4 py-2 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${formErrors.phone ? 'border-destructive' : 'border-border'
                        }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-destructive">{formErrors.phone}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Tên <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nguyễn Văn A"
                      className={`w-full pl-10 pr-4 py-2 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${formErrors.name ? 'border-destructive' : 'border-border'
                        }`}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-destructive">{formErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="admin@ukrestaurant.com"
                      className={`w-full pl-10 pr-4 py-2 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${formErrors.email ? 'border-destructive' : 'border-border'
                        }`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-destructive">{formErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Mật khẩu <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Ít nhất 6 ký tự"
                    className={`w-full px-4 py-2 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${formErrors.password ? 'border-destructive' : 'border-border'
                      }`}
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-destructive">{formErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Xác nhận mật khẩu <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập lại mật khẩu"
                    className={`w-full px-4 py-2 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${formErrors.confirmPassword ? 'border-destructive' : 'border-border'
                      }`}
                  />
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-destructive">{formErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Địa chỉ <span className="text-muted-foreground text-xs">(Tùy chọn)</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Đường ABC"
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Vai trò <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                    >
                      <option value="manager">Manager (Dashboard, Danh mục, Món ăn, Đơn hàng)</option>
                      <option value="admin">Admin (Toàn quyền trừ quản lý Admin)</option>
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Manager: Chỉ truy cập Dashboard, Danh mục, Món ăn, Đơn hàng<br />
                    Admin: Truy cập tất cả trừ quản lý Admin
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-2 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang tạo...</span>
                      </>
                    ) : (
                      <span>Tạo Admin</span>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={creating}
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({
                        phone: '',
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        address: '',
                        role: 'admin',
                      });
                      setFormErrors({});
                    }}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Số điện thoại</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Đăng nhập cuối</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-24"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-28"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-32"></div></td>
                    <td className="px-4 py-4"><div className="h-6 bg-muted rounded-full w-20"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-24"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-24"></div></td>
                    <td className="px-4 py-4 text-right"><div className="h-8 bg-muted rounded ml-auto w-16"></div></td>
                  </tr>
                ))
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Shield className="w-12 h-12 text-muted-foreground/30" />
                      <p className="text-muted-foreground">
                        {searchTerm || roleFilter !== 'all' ? 'Không tìm thấy admin phù hợp' : 'Chưa có tài khoản admin nào'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground font-medium">{admin.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{admin.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{admin.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${admin.role === 'super_admin'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                          : admin.role === 'admin'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                            : 'bg-green-500/20 text-green-400 border border-green-500/50'
                          }`}
                      >
                        {admin.role === 'super_admin' ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <Shield className="w-3 h-3" />
                        )}
                        {admin.role === 'super_admin' ? 'Super Admin' : admin.role === 'admin' ? 'Admin' : 'Manager'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(admin.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(admin.last_login)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                          aria-label="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(admin)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                          aria-label="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 space-y-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-5 bg-muted rounded w-32"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </div>
                <div className="h-6 bg-muted rounded-full w-20"></div>
              </div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="flex gap-2 pt-2">
                <div className="h-10 bg-muted rounded flex-1"></div>
                <div className="h-10 bg-muted rounded flex-1"></div>
              </div>
            </div>
          ))
        ) : admins.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Shield className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || roleFilter !== 'all' ? 'Không tìm thấy admin phù hợp' : 'Chưa có tài khoản admin nào'}
            </p>
          </div>
        ) : (
          admins.map((admin) => (
            <div
              key={admin._id}
              className="bg-card rounded-xl border border-border p-4 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>

              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-bold text-card-foreground truncate">{admin.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${admin.role === 'super_admin'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                        : admin.role === 'admin'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                          : 'bg-green-500/20 text-green-400 border border-green-500/50'
                        }`}
                    >
                      {admin.role === 'super_admin' ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      {admin.role === 'super_admin' ? 'Super Admin' : admin.role === 'admin' ? 'Admin' : 'Manager'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-muted rounded-md shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium">{admin.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-muted rounded-md shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{admin.email}</span>
                    </div>
                    {admin.address && (
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-muted rounded-md shrink-0">
                          <Eye className="w-3.5 h-3.5 text-muted-foreground/60" />
                        </div>
                        <span className="truncate">{admin.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 grid grid-cols-2 gap-4 text-[11px] text-muted-foreground relative z-10">
                <div>
                  <span className="block text-muted-foreground/60">Ngày tạo</span>
                  <span className="font-medium">{formatDate(admin.created_at)}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground/60">Đăng nhập cuối</span>
                  <span className="font-medium text-right block truncate">{formatDate(admin.last_login)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 relative z-10">
                <button
                  onClick={() => handleEdit(admin)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all font-semibold text-sm cursor-pointer border border-primary/20"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => handleDelete(admin)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-all font-semibold text-sm cursor-pointer border border-destructive/20"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={editModalRef}
            className="bg-card rounded-lg max-w-md w-full p-6 border border-border relative"
          >
            <button
              onClick={() => {
                if (editing) return;
                setShowEditModal(false);
                setEditingAdmin(null);
                setEditFormData({ name: '', email: '', address: '', role: 'admin' });
              }}
              disabled={editing}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <Edit2 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-card-foreground">Sửa thông tin admin</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Tên <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Vai trò
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Manager: Dashboard, Danh mục, Món ăn, Đơn hàng | Admin: Toàn quyền trừ quản lý Admin
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateAdmin}
                  disabled={editing}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {editing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    <span>Cập nhật</span>
                  )}
                </button>
                <button
                  disabled={editing}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAdmin(null);
                    setEditFormData({ name: '', email: '', address: '', role: 'admin' });
                  }}
                  className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && editingAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={deleteModalRef}
            className="bg-card rounded-lg max-w-md w-full p-6 border border-border relative"
          >
            <button
              onClick={() => {
                if (deleting) return;
                setShowDeleteModal(false);
                setEditingAdmin(null);
              }}
              disabled={deleting}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="w-6 h-6 text-destructive" />
              <h2 className="text-2xl font-bold text-card-foreground">Xóa admin</h2>
            </div>

            <div className="space-y-4">
              <p className="text-card-foreground">
                Bạn có chắc chắn muốn xóa admin <strong>{editingAdmin.name}</strong>?
              </p>
              {editingAdmin.role === 'super_admin' && (
                <div className="p-3 bg-warning/10 border border-warning/50 rounded-lg">
                  <p className="text-sm text-warning">
                    Cảnh báo: Đây là Super Admin. Hãy đảm bảo còn ít nhất 1 Super Admin khác trong hệ thống.
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Thao tác này sẽ xóa mềm admin (không xóa hoàn toàn).
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <span>Xóa</span>
                  )}
                </button>
                <button
                  disabled={deleting}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setEditingAdmin(null);
                  }}
                  className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50"
                >
                  Hủy
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


