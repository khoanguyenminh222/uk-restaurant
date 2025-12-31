'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, Eye, EyeOff, Loader2, Shield } from 'lucide-react';

export default function AdminLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra nếu đã đăng nhập
    const adminData = localStorage.getItem('admin_data');
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        if (admin.role === 'admin' || admin.role === 'super_admin') {
          router.push('/admin/dashboard');
        }
      } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem('admin_data');
        localStorage.removeItem('admin_logged_in');
      }
    }
    
    // Check for logout success message
    const logoutMessage = localStorage.getItem('admin_logout_success_message');
    if (logoutMessage) {
      setToast({ message: logoutMessage, isVisible: true, type: 'success' });
      localStorage.removeItem('admin_logout_success_message');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate phone format
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      setError('Số điện thoại không hợp lệ');
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: cleanPhone,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Lưu thông tin admin vào localStorage
        localStorage.setItem('admin_data', JSON.stringify(data.data));
        localStorage.setItem('admin_logged_in', 'true');
        
        // Save success message
        localStorage.setItem('admin_login_success_message', 'Đăng nhập thành công!');
        
        // Redirect đến dashboard
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Đăng nhập thất bại');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setError('Lỗi kết nối. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-card-foreground mb-2">
              UK Restaurant
            </h1>
            <p className="text-muted-foreground">Admin Panel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-card-foreground mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPhone(value);
                    setError('');
                  }}
                  placeholder="0901234567"
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  required
                  autoFocus
                  maxLength={11}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-12 py-3 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <span className="text-destructive">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Chỉ dành cho quản trị viên
            </p>
          </div>
        </div>
      </div>
      
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ message: "", isVisible: false })}
        type={toast.type || "success"}
      />
    </div>
  );
}
