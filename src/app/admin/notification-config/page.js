'use client';

import { useState, useEffect } from 'react';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { Settings, Save, Loader2, RotateCcw, Mail } from 'lucide-react';

const TABS = [
  { id: 'email', label: 'Email', icon: Mail },
];

export default function AdminNotificationConfig() {
  const { loading: roleLoading } = useRoleCheck(['admin', 'super_admin']);
  const [activeTab, setActiveTab] = useState('email');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Test email state
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState('');
  const [testError, setTestError] = useState('');

  // Email configuration state
  const [emailData, setEmailData] = useState({
    sender_email: '',
    sender_password: '',
  });

  // Fetch current configuration
  useEffect(() => {
    if (roleLoading) return;
    fetchConfig();
  }, [roleLoading]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/config/landing');
      if (!response.ok) throw new Error('Failed to fetch configuration');
      const result = await response.json();
      
      // API returns { success: true, data: {...} }
      const data = result.data || result;
      
      // Set email configuration
      if (data.email_config) {
        setEmailData({
          sender_email: data.email_config.sender_email || '',
          sender_password: data.email_config.sender_password || '',
        });
      }
    } catch (err) {
      console.error('Error fetching config:', err);
      setError('Không thể tải cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Validate email
      if (!emailData.sender_email || !emailData.sender_email.includes('@')) {
        setError('Email không hợp lệ');
        return;
      }

      if (!emailData.sender_password) {
        setError('Vui lòng nhập mật khẩu email');
        return;
      }

      const response = await fetch('/api/config/landing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_config: {
            sender_email: emailData.sender_email.trim(),
            sender_password: emailData.sender_password,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save configuration');
      }

      setSuccess('Cấu hình đã được lưu thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving config:', err);
      setError(err.message || 'Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Bạn có chắc chắn muốn reset về cấu hình mặc định?')) return;
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Reset to default values (from env)
      setEmailData({
        sender_email: process.env.NEXT_PUBLIC_DEFAULT_EMAIL || '',
        sender_password: '',
      });

      setSuccess('Đã reset về cấu hình mặc định. Nhấn "Lưu cấu hình" để áp dụng.');
    } catch (err) {
      console.error('Error resetting config:', err);
      setError('Có lỗi xảy ra khi reset cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setSendingTest(true);
      setTestError('');
      setTestSuccess('');

      // Validate test email
      if (!testEmail || !testEmail.includes('@')) {
        setTestError('Email không hợp lệ');
        return;
      }

      const response = await fetch('/api/config/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_email: testEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }

      setTestSuccess(`Email đã được gửi thành công đến ${testEmail}. Vui lòng kiểm tra hộp thư đến hoặc spam.`);
      setTimeout(() => setTestSuccess(''), 5000);
    } catch (err) {
      console.error('Error sending test email:', err);
      setTestError(err.message || 'Có lỗi xảy ra khi gửi email thử nghiệm');
    } finally {
      setSendingTest(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Cấu hình thông báo</h1>
          </div>
          <p className="text-muted-foreground">Quản lý cấu hình email và các kênh thông báo khác</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Cấu hình Email</h2>
              
              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-400 mb-2">
                  <strong>Lưu ý quan trọng:</strong>
                </p>
                <ul className="text-sm text-blue-400 space-y-1 list-disc list-inside">
                  <li>Email này sẽ được sử dụng để gửi tất cả email từ hệ thống (xác thực, đặt lại mật khẩu, xác nhận đơn hàng)</li>
                  <li>Tên người gửi sẽ tự động lấy từ "Tên cửa hàng" trong Cấu hình Landing Page</li>
                  <li>Nếu dùng Gmail, bạn cần bật "App Password" thay vì dùng mật khẩu thường</li>
                  <li><strong>App Password có khoảng trắng là bình thường</strong> (ví dụ: xxxx xxxx xxxx xxxx)</li>
                  <li>Hướng dẫn tạo App Password: <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">Xem tại đây</a></li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Email gửi <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={emailData.sender_email}
                  onChange={(e) => setEmailData({ ...emailData, sender_email: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your-email@gmail.com"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Email này sẽ được dùng làm địa chỉ người gửi cho tất cả email từ hệ thống.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Mật khẩu email <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={emailData.sender_password}
                  onChange={(e) => setEmailData({ ...emailData, sender_password: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••••••••••"
                  maxLength={200}
                />
                <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Đối với Gmail:</strong>
                  </p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Vào tài khoản Google của bạn</li>
                    <li>Chọn "Bảo mật" (Security)</li>
                    <li>Bật "Xác minh 2 bước" (2-Step Verification) nếu chưa bật</li>
                    <li>Tìm "Mật khẩu ứng dụng" (App passwords)</li>
                    <li>Tạo mật khẩu mới cho "Mail"</li>
                    <li>Sao chép mật khẩu 16 ký tự và dán vào đây</li>
                  </ol>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-sm text-yellow-400">
                  <strong>Bảo mật:</strong> Mật khẩu sẽ được lưu an toàn trong database. Không chia sẻ thông tin này với bất kỳ ai.
                </p>
              </div>

              {/* Test Email Section (Optional - for future enhancement) */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-medium text-card-foreground mb-3">Kiểm tra email</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sau khi lưu cấu hình, bạn có thể gửi email thử nghiệm để kiểm tra kết nối.
                </p>

                {/* Test Success/Error Messages */}
                {testSuccess && (
                  <div className="mb-4 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                    {testSuccess}
                  </div>
                )}
                {testError && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {testError}
                  </div>
                )}

                <div className="flex gap-3">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập email để nhận email thử nghiệm"
                    disabled={sendingTest}
                  />
                  <button
                    onClick={handleSendTestEmail}
                    disabled={sendingTest || !testEmail}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {sendingTest ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Gửi email thử
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex cursor-pointer items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset về mặc định
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex cursor-pointer items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu cấu hình
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
