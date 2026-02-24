'use client';

import { useState, useEffect, useRef } from 'react';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { formatCurrency } from '@/utils/helpers';
import Toast from '@/components/Toast/Toast';
import { adminFetch } from '@/lib/adminAuth';
import {
  Users,
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
  Shield,
  ShieldCheck,
  ShoppingCart,
  DollarSign,
  RotateCcw
} from 'lucide-react';

export default function AdminUsers() {
  // Check if user has permission (only admin and super_admin)
  const { isAuthorized, isChecking, currentAdmin: adminFromHook } = useRoleCheck(['admin', 'super_admin']);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    address: '',
    role: 'user',
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Refs for modals
  const detailModalRef = useRef(null);
  const editModalRef = useRef(null);
  const deleteModalRef = useRef(null);

  useEffect(() => {
    // Get current admin info from localStorage
    const adminData = localStorage.getItem('admin_data');
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        setCurrentAdmin(admin);
      } catch (e) {
        console.error('Error parsing admin data:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (currentAdmin !== null) {
      fetchUsers();
    }
  }, [roleFilter, pagination.page, currentAdmin]);

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
      if (editing || deleting) return;

      if (showDetailModal && detailModalRef.current && !detailModalRef.current.contains(event.target)) {
        setShowDetailModal(false);
        setSelectedUser(null);
      }
      if (showEditModal && editModalRef.current && !editModalRef.current.contains(event.target)) {
        setShowEditModal(false);
        setSelectedUser(null);
        setEditFormData({ name: '', email: '', address: '', role: 'user' });
      }
      if (showDeleteModal && deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowDeleteModal(false);
        setSelectedUser(null);
      }
    }

    if (showDetailModal || showEditModal || showDeleteModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDetailModal, showEditModal, showDeleteModal, editing, deleting]);

  // Handle scroll lock when modal is open
  useEffect(() => {
    if (showDetailModal || showEditModal || showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDetailModal, showEditModal, showDeleteModal]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: 'created_at',
        sortOrder: 'desc',
      });

      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await adminFetch(`/api/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Lỗi khi tải danh sách người dùng', type: 'error' },
            })
          );
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
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

  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearching(true);
    try {
      await fetchUsers();
    } finally {
      setSearching(false);
    }
  };

  const handleEdit = (user) => {
    // Prevent editing admin/super_admin if current admin is admin (not super_admin)
    if (currentAdmin && currentAdmin.role === 'admin' && (user.role === 'admin' || user.role === 'super_admin')) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Bạn không có quyền sửa tài khoản admin/super_admin', type: 'error' },
          })
        );
      }
      return;
    }
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      address: user.address || '',
      role: user.role || 'user',
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setEditing(true);
    try {
      const response = await adminFetch(`/api/users/${selectedUser.user_id || selectedUser._id}`, {
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
              detail: { message: 'Đã cập nhật thông tin người dùng thành công!', type: 'success' },
            })
          );
        }
        fetchUsers();
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Không thể cập nhật thông tin người dùng', type: 'error' },
            })
          );
        }
      }
    } catch (err) {
      console.error('Error updating user:', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi cập nhật người dùng', type: 'error' },
          })
        );
      }
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = (user) => {
    // Prevent deleting admin/super_admin if current admin is admin (not super_admin)
    if (currentAdmin && currentAdmin.role === 'admin' && (user.role === 'admin' || user.role === 'super_admin')) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Bạn không có quyền xóa tài khoản admin/super_admin', type: 'error' },
          })
        );
      }
      return;
    }
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setDeleting(true);
    try {
      const response = await adminFetch(`/api/users/${selectedUser.user_id || selectedUser._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: `Đã xóa người dùng thành công!${data.has_orders ? ` (Người dùng có ${data.order_count} đơn hàng)` : ''}`, type: 'success' },
            })
          );
        }
        fetchUsers();
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Không thể xóa người dùng', type: 'error' },
            })
          );
        }
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi xóa người dùng', type: 'error' },
          })
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (user) => {
    if (!user) return;

    setEditing(true);
    try {
      const response = await adminFetch(`/api/users/${user.user_id || user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_deleted: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Đã khôi phục người dùng thành công!', type: 'success' },
            })
          );
        }
        fetchUsers();
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Không thể khôi phục người dùng', type: 'error' },
            })
          );
        }
      }
    } catch (err) {
      console.error('Error restoring user:', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi khôi phục người dùng', type: 'error' },
          })
        );
      }
    } finally {
      setEditing(false);
    }
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

  // Check if current admin can interact with a user (edit/delete)
  const canInteractWithUser = (user) => {
    // If current admin is super_admin, can interact with all users
    if (currentAdmin && currentAdmin.role === 'super_admin') {
      return true;
    }
    // If current admin is admin, cannot interact with admin/super_admin users
    if (currentAdmin && currentAdmin.role === 'admin' && (user.role === 'admin' || user.role === 'super_admin')) {
      return false;
    }
    return true;
  };

  const getRoleBadge = (role) => {
    if (role === 'super_admin') {
      return {
        label: 'Super Admin',
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
        icon: ShieldCheck,
      };
    } else if (role === 'admin') {
      return {
        label: 'Admin',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
        icon: Shield,
      };
    } else if (role === 'manager') {
      return {
        label: 'Manager',
        color: 'bg-green-500/20 text-green-400 border border-green-500/50',
        icon: Shield,
      };
    }
    return {
      label: 'User',
      color: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
      icon: Users,
    };
  };

  // Show loading while checking auth or fetching data
  if (isChecking || (loading && users.length === 0)) {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-card-foreground leading-tight">Quản lý Người dùng</h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Danh sách khách hàng và vai trò hệ thống</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar py-1 sm:py-0">
          <div className="px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50 shrink-0">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block leading-none mb-1">Tổng cộng</span>
            <span className="text-sm font-bold">{pagination.total}</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-card rounded-xl border border-border p-3 sm:p-4 space-y-3 shadow-sm transition-all duration-300">
        {/* Main Search Row */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm tên, SĐT, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all font-semibold text-sm cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-sm shrink-0"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Tìm</span>}
          </button>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`sm:hidden flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${showMobileFilters || roleFilter !== 'all'
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-muted/30 border-border text-muted-foreground'
              }`}
          >
            <Filter className="w-4 h-4" />
            {roleFilter !== 'all' && (
              <span className="flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full">1</span>
            )}
          </button>
        </div>

        {/* Collapsible/Desktop Filters */}
        <div className={`${showMobileFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row items-center gap-3 pt-3 sm:pt-0 sm:border-t-0 border-t border-border/50 animate-in slide-in-from-top-2 duration-300`}>
          {/* Role Filter */}
          <div className="w-full sm:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-9 pr-8 py-2 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>

          {(searchTerm || roleFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors ml-auto sm:ml-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  SĐT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Số đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tổng chi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Đăng nhập lần cuối
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-muted-foreground">
                    {searchTerm || roleFilter !== 'all' ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const RoleIcon = roleBadge.icon;
                  const isDeleted = user.is_deleted === true;
                  return (
                    <tr key={user._id || user.user_id} className={`hover:bg-muted/50 transition-colors ${isDeleted ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-card-foreground">{user.name}</span>
                          {isDeleted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-600 border border-red-500/50">
                              Đã xóa
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <a href={`tel:${user.phone}`} className="hover:text-primary">
                          {user.phone}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {user.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${roleBadge.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {user.order_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                        {formatCurrency(user.total_spent || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(user.last_login)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                            aria-label="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isDeleted ? (
                            <button
                              onClick={() => handleRestore(user)}
                              className="p-2 text-green-600 hover:bg-green-500/10 rounded-lg transition-colors cursor-pointer"
                              aria-label="Khôi phục"
                              disabled={editing}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(user)}
                                disabled={!canInteractWithUser(user)}
                                className={`p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors ${canInteractWithUser(user) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                  }`}
                                aria-label="Sửa"
                                title={!canInteractWithUser(user) ? 'Bạn không có quyền sửa tài khoản admin/super_admin' : 'Sửa'}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(user)}
                                disabled={!canInteractWithUser(user)}
                                className={`p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors ${canInteractWithUser(user) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                  }`}
                                aria-label="Xóa"
                                title={!canInteractWithUser(user) ? 'Bạn không có quyền xóa tài khoản admin/super_admin' : 'Xóa'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
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
        {users.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || roleFilter !== 'all' ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
            </p>
          </div>
        ) : (
          users.map((user) => {
            const roleBadge = getRoleBadge(user.role);
            const RoleIcon = roleBadge.icon;
            const isDeleted = user.is_deleted === true;
            return (
              <div
                key={user._id || user.user_id}
                className={`bg-card rounded-lg border border-border p-3.5 space-y-2.5 transition-all hover:border-primary/30 ${isDeleted ? 'opacity-60 bg-muted/20 grayscale' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-sm font-semibold text-card-foreground">{user.name}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border shrink-0 ${roleBadge.color}`}>
                        <RoleIcon className="w-3 h-3" />
                        {roleBadge.label}
                      </span>
                      {isDeleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-600 border border-red-500/50 shrink-0">
                          Đã xóa
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${user.phone}`} className="hover:text-primary">
                          {user.phone}
                        </a>
                      </p>
                      {user.email && (
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </p>
                      )}
                      <div className="flex items-center gap-4 pt-2 border-t border-border/50 text-xs">
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="w-3.5 h-3.5 text-primary/70" />
                          <span className="font-medium text-foreground">{user.order_count || 0}</span>
                          <span className="text-muted-foreground">đơn</span>
                        </div>
                        <div className="flex items-center gap-1 border-l border-border/50 pl-4">
                          <DollarSign className="w-3.5 h-3.5 text-success/70" />
                          <span className="font-semibold text-foreground">{formatCurrency(user.total_spent || 0)}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border space-y-1">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Ngày tạo:</span> {formatDate(user.created_at)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Đăng nhập lần cuối:</span> {formatDate(user.last_login)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDetailModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all font-semibold text-xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chi tiết</span>
                  </button>
                  {isDeleted ? (
                    <button
                      onClick={() => handleRestore(user)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-all font-semibold text-xs cursor-pointer"
                      disabled={editing}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Khôi phục</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(user)}
                        disabled={!canInteractWithUser(user)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all font-semibold text-xs ${canInteractWithUser(user) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                          }`}
                        title={!canInteractWithUser(user) ? 'Bạn không có quyền sửa tài khoản admin/super_admin' : 'Sửa'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={!canInteractWithUser(user)}
                        className={`px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-all ${canInteractWithUser(user) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                          }`}
                        title={!canInteractWithUser(user) ? 'Bạn không có quyền xóa tài khoản admin/super_admin' : 'Xóa'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
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
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={detailModalRef}
            className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border border-border animate-in fade-in zoom-in duration-200"
          >
            <button
              onClick={() => {
                setShowDetailModal(false);
                setSelectedUser(null);
              }}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer z-20"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-card-foreground">Chi tiết người dùng</h2>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tên</p>
                    <p className="font-medium text-card-foreground">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Vai trò</p>
                    {(() => {
                      const roleBadge = getRoleBadge(selectedUser.role);
                      const RoleIcon = roleBadge.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${roleBadge.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {roleBadge.label}
                        </span>
                      );
                    })()}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Số điện thoại</p>
                    <a href={`tel:${selectedUser.phone}`} className="font-medium text-primary hover:underline">
                      {selectedUser.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium text-card-foreground">{selectedUser.email || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Địa chỉ</p>
                    <p className="font-medium text-card-foreground">{selectedUser.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ngày tạo</p>
                    <p className="font-medium text-card-foreground">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Đăng nhập cuối</p>
                    <p className="font-medium text-card-foreground">{formatDate(selectedUser.last_login)}</p>
                  </div>
                </div>

                {/* Statistics */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold text-card-foreground mb-3">Thống kê</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        <p className="text-sm text-muted-foreground">Tổng số đơn</p>
                      </div>
                      <p className="text-2xl font-bold text-card-foreground">{selectedUser.order_count || 0}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(selectedUser.total_spent || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={editModalRef}
            className="bg-card rounded-xl max-w-md w-full p-6 border border-border relative shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <button
              onClick={() => {
                if (editing) return;
                setShowEditModal(false);
                setSelectedUser(null);
                setEditFormData({ name: '', email: '', address: '', role: 'user' });
              }}
              disabled={editing}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <Edit2 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-card-foreground">Sửa thông tin người dùng</h2>
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
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  {currentAdmin?.role === 'super_admin' && (
                    <option value="super_admin">Super Admin</option>
                  )}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateUser}
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
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    setEditFormData({ name: '', email: '', address: '', role: 'user' });
                  }}
                  className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={deleteModalRef}
            className="bg-card rounded-xl max-w-md w-full p-6 border border-border relative shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <button
              onClick={() => {
                if (deleting) return;
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
              disabled={deleting}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="w-6 h-6 text-destructive" />
              <h2 className="text-2xl font-bold text-card-foreground">Xóa người dùng</h2>
            </div>

            <div className="space-y-4">
              <p className="text-card-foreground">
                Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser.name}</strong>?
              </p>
              {selectedUser.order_count > 0 && (
                <div className="p-3 bg-warning/10 border border-warning/50 rounded-lg">
                  <p className="text-sm text-warning">
                    Cảnh báo: Người dùng này có {selectedUser.order_count} đơn hàng. Dữ liệu đơn hàng sẽ được giữ nguyên.
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Thao tác này sẽ xóa mềm người dùng (không xóa hoàn toàn).
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium cursor-pointer"
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

