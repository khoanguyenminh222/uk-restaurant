'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/helpers';
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
  DollarSign
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, pagination.page]);

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

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      } else {
        setError(data.error || 'Lỗi khi tải danh sách người dùng');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
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
    }
    return {
      label: 'User',
      color: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
      icon: Users,
    };
  };

  if (loading && users.length === 0) {
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
          <Users className="w-7 h-7 text-primary" />
          <h1 className="text-2xl lg:text-3xl font-bold text-card-foreground">Quản lý Người dùng</h1>
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
              placeholder="Tìm theo tên, SĐT, email..."
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
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
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
                  return (
                    <tr key={user._id || user.user_id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-card-foreground">{user.name}</span>
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
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          aria-label="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
            return (
              <div
                key={user._id || user.user_id}
                className="bg-card rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-card-foreground">{user.name}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border shrink-0 ${roleBadge.color}`}>
                        <RoleIcon className="w-3 h-3" />
                        {roleBadge.label}
                      </span>
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
                      <div className="flex items-center gap-4 pt-2 border-t border-border">
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4" />
                          <span>{user.order_count || 0} đơn</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatCurrency(user.total_spent || 0)}</span>
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
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowDetailModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium"
                >
                  <Eye className="w-4 h-4" />
                  <span>Xem chi tiết</span>
                </button>
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
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setShowDetailModal(false);
                setSelectedUser(null);
              }}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors"
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
    </div>
  );
}

