'use client';

import { useState, useEffect } from 'react';
import { UserPlus, X, Mail, Phone, User, Shield, ShieldCheck, Loader2, Edit2, Trash2 } from 'lucide-react';

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null); // Current logged-in admin
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Get current admin info
    try {
      const adminData = localStorage.getItem('admin_data');
      if (adminData) {
        const admin = JSON.parse(adminData);
        setCurrentAdmin(admin);
      }
    } catch (e) {
      console.error('Error getting admin data:', e);
    }
    
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/admins');
      const data = await response.json();

      if (data.success) {
        setAdmins(data.data || []);
      } else {
        setError(data.error || 'Không thể tải danh sách admin');
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError('Lỗi khi tải danh sách admin');
    } finally {
      setLoading(false);
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
    setError('');
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/admin/create-admin', {
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
          currentAdminPhone: currentAdmin?.phone, // Send current admin phone for auth check
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message || 'Đã tạo tài khoản admin thành công');
        setFormData({
          phone: '',
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          address: '',
        });
        setShowCreateForm(false);
        fetchAdmins(); // Refresh list
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Không thể tạo tài khoản admin');
      }
    } catch (err) {
      console.error('Error creating admin:', err);
      setError('Lỗi kết nối. Vui lòng thử lại sau.');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Quản lý Admin
        </h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg font-medium transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Tạo Admin mới
        </button>
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

      {/* Create Admin Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
            <button
              onClick={() => {
                setShowCreateForm(false);
                setFormData({
                  phone: '',
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  address: '',
                });
                setFormErrors({});
                setError('');
              }}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors z-10"
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
                      className={`w-full pl-10 pr-4 py-2 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                        formErrors.phone ? 'border-destructive' : 'border-border'
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
                      className={`w-full pl-10 pr-4 py-2 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                        formErrors.name ? 'border-destructive' : 'border-border'
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
                      className={`w-full pl-10 pr-4 py-2 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                        formErrors.email ? 'border-destructive' : 'border-border'
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
                    className={`w-full px-4 py-2 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                      formErrors.password ? 'border-destructive' : 'border-border'
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
                    className={`w-full px-4 py-2 bg-input border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                      formErrors.confirmPassword ? 'border-destructive' : 'border-border'
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

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-2 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({
                        phone: '',
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        address: '',
                      });
                      setFormErrors({});
                      setError('');
                    }}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Admins List */}
      <div className="bg-card/50 rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Tên</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Số điện thoại</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Vai trò</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Ngày tạo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Đăng nhập cuối</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                    Chưa có admin nào
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-card-foreground">{admin.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{admin.phone}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{admin.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          admin.role === 'super_admin'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                        }`}
                      >
                        {admin.role === 'super_admin' ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <Shield className="w-3 h-3" />
                        )}
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(admin.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(admin.last_login)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

