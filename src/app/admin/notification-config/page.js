'use client';

import { useState, useEffect, useRef } from 'react';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import Toast from '@/components/Toast/Toast';
import { Settings, Save, Loader2, RotateCcw, Mail, MessageSquare, X, ArrowUpRight, Check, Eye, Trash2 } from 'lucide-react';
import { adminFetch } from '@/lib/adminAuth';

const TABS = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'telegram', label: 'Telegram', icon: MessageSquare },
];

export default function AdminNotificationConfig() {
  const { loading: roleLoading } = useRoleCheck(['admin', 'super_admin']);
  const [activeTab, setActiveTab] = useState('email');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', isVisible: false });

  // Test email state
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Test Telegram state
  const [sendingTelegramTest, setSendingTelegramTest] = useState(false);

  // Reset Modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const resetModalRef = useRef(null);
  const [resetSections, setResetSections] = useState({
    email: false,
    telegram: false,
  });

  // Email configuration state
  const [emailData, setEmailData] = useState({
    sender_email: '',
    sender_password: '',
    email_notifications: {
      confirmed: true,
      preparing: false,
      ready: false,
      delivered: true,
      completed: false,
      cancelled: true,
    },
  });

  // Telegram configuration state
  const [telegramData, setTelegramData] = useState({
    enabled: true,
    bot_token: '',
    chat_id: '',
  });

  // Fetch current configuration
  useEffect(() => {
    if (roleLoading) return;
    fetchConfig();
  }, [roleLoading]);

  // Handle click outside for all modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if saving
      if (saving) return;

      if (showResetModal && resetModalRef.current && !resetModalRef.current.contains(event.target)) {
        setShowResetModal(false);
      }
    };

    if (showResetModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showResetModal, saving]);

  // Handle scroll lock when any modal is open
  useEffect(() => {
    if (showResetModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showResetModal]);

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

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await adminFetch('/api/config/landing');
      if (!response.ok) throw new Error('Failed to fetch configuration');
      const result = await response.json();

      // API returns { success: true, data: {...} }
      const data = result.data || result;

      // Set email configuration
      if (data.email_config) {
        setEmailData({
          sender_email: data.email_config.sender_email || '',
          sender_password: data.email_config.sender_password || '',
          email_notifications: data.email_config.email_notifications || {
            confirmed: true,
            preparing: false,
            ready: false,
            delivered: true,
            completed: false,
            cancelled: true,
          },
        });
      }

      // Set Telegram configuration
      if (data.telegram_config) {
        setTelegramData({
          enabled: data.telegram_config.enabled !== false,
          bot_token: data.telegram_config.bot_token || '',
          chat_id: data.telegram_config.chat_id || '',
        });
      }
    } catch (err) {
      console.error('Error fetching config:', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Không thể tải cấu hình', type: 'error' },
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate based on active tab
      if (activeTab === 'email') {
        if (!emailData.sender_email || !emailData.sender_email.includes('@')) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('showToast', {
                detail: { message: 'Email không hợp lệ', type: 'error' },
              })
            );
          }
          return;
        }

        if (!emailData.sender_password) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('showToast', {
                detail: { message: 'Vui lòng nhập mật khẩu email', type: 'error' },
              })
            );
          }
          return;
        }
      } else if (activeTab === 'telegram') {
        if (!telegramData.bot_token) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('showToast', {
                detail: { message: 'Vui lòng nhập Bot Token', type: 'error' },
              })
            );
          }
          return;
        }

        if (!telegramData.chat_id) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('showToast', {
                detail: { message: 'Vui lòng nhập Chat ID', type: 'error' },
              })
            );
          }
          return;
        }
      }

      const updateData = {};

      // Only include email_config if we're on email tab or both tabs have data
      if (activeTab === 'email' || emailData.sender_email || emailData.sender_password) {
        updateData.email_config = {
          sender_email: emailData.sender_email.trim(),
          sender_password: emailData.sender_password,
          email_notifications: emailData.email_notifications,
        };
      }

      // Only include telegram_config if we're on telegram tab or both tabs have data
      if (activeTab === 'telegram' || telegramData.bot_token || telegramData.chat_id) {
        updateData.telegram_config = {
          enabled: telegramData.enabled,
          bot_token: telegramData.bot_token.trim(),
          chat_id: telegramData.chat_id.trim(),
        };
      }

      const response = await adminFetch('/api/config/landing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Có lỗi xảy ra khi lưu cấu hình', type: 'error' },
            })
          );
        }
        return;
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Cấu hình đã được lưu thành công!', type: 'success' },
          })
        );
      }
    } catch (err) {
      console.error('Error saving config:', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: err.message || 'Có lỗi xảy ra khi lưu cấu hình', type: 'error' },
          })
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const sectionNames = {
      email: 'Email',
      telegram: 'Telegram',
    };

    // Kiểm tra xem có phần nào được chọn không
    const selectedSections = Object.entries(resetSections)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key);

    if (selectedSections.length === 0) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Vui lòng chọn ít nhất một phần để reset', type: 'error' },
          })
        );
      }
      return;
    }

    try {
      setSaving(true);
      setShowResetModal(false);

      // Tạo object chứa các giá trị mặc định cho các phần được chọn
      const resetData = {};

      // Reset Email nếu được chọn
      if (resetSections.email) {
        resetData.email_config = {
          sender_email: process.env.NEXT_PUBLIC_DEFAULT_EMAIL || '',
          sender_password: '',
          email_notifications: {
            confirmed: true,
            preparing: false,
            ready: false,
            delivered: true,
            completed: false,
            cancelled: true,
          },
        };
      }

      // Reset Telegram nếu được chọn
      if (resetSections.telegram) {
        resetData.telegram_config = {
          enabled: true,
          bot_token: '',
          chat_id: '',
        };
      }

      // Gửi request reset
      const res = await adminFetch('/api/config/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData),
      });

      const data = await res.json();
      if (data.success) {
        const resetParts = Object.entries(resetSections)
          .filter(([_, checked]) => checked)
          .map(([key, _]) => sectionNames[key])
          .join(', ');

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: `Đã reset phần "${resetParts}" về giá trị mặc định!`, type: 'success' },
            })
          );
        }
        fetchConfig(); // Reload dữ liệu từ database
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Lỗi khi reset', type: 'error' },
            })
          );
        }
      }
    } catch (err) {
      console.error('Error resetting config:', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Có lỗi xảy ra khi reset cấu hình', type: 'error' },
          })
        );
      }
    } finally {
      setSaving(false);
      setResetSections({
        email: false,
        telegram: false,
      });
    }
  };

  const handleSendTestTelegram = async () => {
    try {
      setSendingTelegramTest(true);

      // Validate Telegram config
      if (!telegramData.bot_token) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Vui lòng nhập Bot Token trước khi test', type: 'error' },
            })
          );
        }
        return;
      }

      if (!telegramData.chat_id) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Vui lòng nhập Chat ID trước khi test', type: 'error' },
            })
          );
        }
        return;
      }

      // Save config first
      await handleSave();

      const response = await adminFetch('/api/config/test-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Có lỗi xảy ra khi gửi thông báo Telegram thử nghiệm', type: 'error' },
            })
          );
        }
        return;
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Thông báo Telegram đã được gửi thành công! Vui lòng kiểm tra Telegram group/channel của bạn.', type: 'success' },
          })
        );
      }
    } catch (err) {
      console.error('Error sending test Telegram message:', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: err.message || 'Có lỗi xảy ra khi gửi thông báo Telegram thử nghiệm', type: 'error' },
          })
        );
      }
    } finally {
      setSendingTelegramTest(false);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setSendingTest(true);

      // Validate test email
      if (!testEmail || !testEmail.includes('@')) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Email không hợp lệ', type: 'error' },
            })
          );
        }
        return;
      }

      const response = await adminFetch('/api/config/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_email: testEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Có lỗi xảy ra khi gửi email thử nghiệm', type: 'error' },
            })
          );
        }
        return;
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: `Email đã được gửi thành công đến ${testEmail}. Vui lòng kiểm tra hộp thư đến hoặc spam.`, type: 'success' },
          })
        );
      }
    } catch (err) {
      console.error('Error sending test email:', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: err.message || 'Có lỗi xảy ra khi gửi email thử nghiệm', type: 'error' },
          })
        );
      }
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
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast({ message: '', isVisible: false })}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Settings className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-card-foreground">Cấu hình thông báo</h1>
              <p className="text-sm text-muted-foreground mt-1 text-balance">Quản lý cấu hình email và các kênh thông báo tự động từ hệ thống</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="w-full overflow-x-auto pb-4 mb-2 scrollbar-none">
          <div className="flex gap-2 min-w-max p-1 bg-muted/30 rounded-2xl border border-border/50">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all font-bold text-sm cursor-pointer whitespace-nowrap active:scale-95 ${isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="mb-6 space-y-6">
          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Instructions */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" />
                      Hướng dẫn cấu hình
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Vai trò email</p>
                        <p className="text-sm text-card-foreground leading-relaxed">
                          Email này được sử dụng để gửi tất cả thông báo hệ thống như <b>xác thực tài khoản, đặt lại mật khẩu và xác nhận đơn hàng</b>.
                        </p>
                      </div>
                      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Đối với Gmail</p>
                        <ul className="text-[13px] text-muted-foreground space-y-2 list-disc list-inside">
                          <li>Bật <b>Xác minh 2 bước</b> trong tài khoản Google.</li>
                          <li>Tạo <b>App Password</b> cho mục "Thư".</li>
                          <li>Sử dụng mật khẩu 16 ký tự đó thay cho mật khẩu chính.</li>
                        </ul>
                        <a
                          href="https://support.google.com/accounts/answer/185833"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex text-xs font-bold text-primary hover:underline items-center gap-1"
                        >
                          Xem hướng dẫn chi tiết <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      Kiểm tra kết nối
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        placeholder="Nhập email nhận thử..."
                        disabled={sendingTest}
                      />
                      <button
                        onClick={handleSendTestEmail}
                        disabled={sendingTest || !testEmail}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted-foreground/10 text-foreground rounded-xl transition-all font-bold border border-border active:scale-95 cursor-pointer disabled:opacity-50 text-sm"
                      >
                        {sendingTest ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang gửi...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            <span>Gửi email thử</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Settings */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Account Settings */}
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                      <div className="w-1.5 h-5 bg-primary rounded-full" />
                      Thông tin tài khoản gửi
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-card-foreground flex items-center gap-1.5">
                          Email người gửi <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="email"
                          value={emailData.sender_email}
                          onChange={(e) => setEmailData({ ...emailData, sender_email: e.target.value })}
                          className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          placeholder="your-email@gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-card-foreground flex items-center gap-1.5">
                          Ứng dụng Password <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="password"
                          value={emailData.sender_password}
                          onChange={(e) => setEmailData({ ...emailData, sender_password: e.target.value })}
                          className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          placeholder="•••• •••• •••• ••••"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Configuration */}
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                        <div className="w-1.5 h-5 bg-primary rounded-full" />
                        Thông báo theo trạng thái
                      </h3>
                      <p className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
                        Gửi email tự động khi đơn hàng đổi trạng thái
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'confirmed', label: 'Xác nhận đơn', icon: '✅', color: '#10b981', desc: 'Đã nhận đơn hàng' },
                        { key: 'preparing', label: 'Đang chuẩn bị', icon: '👨‍🍳', color: '#3b82f6', desc: 'Đang chế biến' },
                        { key: 'ready', label: 'Đã sẵn sàng', icon: '🥡', color: '#f59e0b', desc: 'Đã xong món' },
                        { key: 'delivered', label: 'Đã giao hàng', icon: '🛵', color: '#8b5cf6', desc: 'Đã giao cho khách' },
                        { key: 'completed', label: 'Hoàn thành', icon: '⭐', color: '#ec4899', desc: 'Đơn hàng kết thúc' },
                        { key: 'cancelled', label: 'Đã hủy đơn', icon: '❌', color: '#ef4444', desc: 'Đơn bị hủy bỏ' },
                      ].map((status) => {
                        const isChecked = emailData.email_notifications[status.key];
                        return (
                          <div
                            key={status.key}
                            className={`group relative p-4 rounded-2xl border transition-all cursor-pointer select-none ${isChecked
                              ? 'bg-card border-primary/30 shadow-md shadow-primary/5'
                              : 'bg-muted/30 border-border/50 hover:border-primary/20'
                              }`}
                            onClick={() => {
                              setEmailData({
                                ...emailData,
                                email_notifications: {
                                  ...emailData.email_notifications,
                                  [status.key]: !isChecked,
                                },
                              });
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110 ${isChecked ? 'bg-white' : 'bg-muted'}`} style={{ borderLeft: `4px solid ${status.color}` }}>
                                {status.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-[13px] font-bold truncate ${isChecked ? 'text-card-foreground' : 'text-muted-foreground'}`}>
                                  {status.label}
                                </h4>
                                <p className="text-[11px] text-muted-foreground truncate">{status.desc}</p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-primary border-primary' : 'border-border'}`}>
                                {isChecked && <Check className="w-3 h-3 text-white" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Telegram Tab */}
          {activeTab === 'telegram' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
                {/* Left Column: Instructions */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Hướng dẫn Telegram
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Tính năng</p>
                        <p className="text-sm text-card-foreground leading-relaxed">
                          Telegram Bot sẽ tự động thông báo khi có <b>đơn hàng mới, đơn hàng bị hủy hoặc cập nhật trạng thái</b>.
                        </p>
                      </div>
                      <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Cách lấy Chat ID</p>
                        <ol className="text-[13px] text-muted-foreground space-y-2 list-decimal list-inside">
                          <li>Tìm <b>@BotFather</b> để tạo bot mới.</li>
                          <li>Thêm bot vào Group/Channel.</li>
                          <li>Dùng bot <b>@userinfobot</b> để lấy Chat ID của Group đó.</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      Kiểm tra Bot
                    </h3>
                    <div className="space-y-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Hãy lưu cấu hình trước khi thử nghiệm để đảm bảo Bot đã được kết nối đúng.
                      </p>
                      <button
                        onClick={handleSendTestTelegram}
                        disabled={sendingTelegramTest || !telegramData.bot_token || !telegramData.chat_id}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted-foreground/10 text-foreground rounded-xl transition-all font-bold border border-border active:scale-95 cursor-pointer disabled:opacity-50 text-sm"
                      >
                        {sendingTelegramTest ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang test...</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4" />
                            <span>Gửi test Telegram</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Settings */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Connection Settings */}
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                        <div className="w-1.5 h-5 bg-primary rounded-full" />
                        Kết nối Telegram Bot
                      </h3>
                      <button
                        onClick={() => setTelegramData({ ...telegramData, enabled: !telegramData.enabled })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${telegramData.enabled ? 'bg-primary' : 'bg-muted'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${telegramData.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-card-foreground flex items-center gap-1.5 font-mono">
                          Bot Token <span className="text-destructive">*</span>
                        </label>
                        <div className="relative group">
                          <input
                            type="text"
                            value={telegramData.bot_token}
                            onChange={(e) => setTelegramData({ ...telegramData, bot_token: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-muted/40 border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[13px]"
                            placeholder="1234567890:ABCdef..."
                          />
                          <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-card-foreground flex items-center gap-1.5 font-mono">
                          Chat ID <span className="text-destructive">*</span>
                        </label>
                        <div className="relative group">
                          <input
                            type="text"
                            value={telegramData.chat_id}
                            onChange={(e) => setTelegramData({ ...telegramData, chat_id: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-muted/40 border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[13px]"
                            placeholder="-1001234567890"
                          />
                          <Settings className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3">
                      <div className="mt-0.5">⚠️</div>
                      <p className="text-xs text-amber-600 leading-relaxed italic">
                        Bot Token và Chat ID là thông tin bảo mật. Đảm bảo cấu hình đúng Group/Channel để tránh lộ lọt thông tin đơn hàng của khách hàng.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border z-10 lg:relative lg:bg-transparent lg:border-none lg:p-0 lg:mt-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-end gap-3 lg:gap-4">
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-muted hover:bg-muted-foreground/10 text-foreground rounded-2xl transition-all font-bold border border-border active:scale-95 cursor-pointer text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset mặc định
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-2xl transition-all font-bold shadow-lg shadow-primary/25 hover:bg-primary-dark active:scale-95 disabled:opacity-50 cursor-pointer text-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu cấu hình</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Spacer for fixed bar on mobile */}
        <div className="h-32 lg:hidden" />

        {/* Reset Confirmation Modal */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
              ref={resetModalRef}
              className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            >
              <div className="relative p-8 text-center">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="absolute right-4 top-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RotateCcw className="w-10 h-10 text-amber-500" />
                </div>

                <h3 className="text-2xl font-bold text-card-foreground mb-2">Reset cấu hình?</h3>
                <p className="text-muted-foreground mb-8 text-balance text-sm">
                  Dữ liệu hiện tại sẽ bị ghi đè bằng giá trị mặc định. Vui lòng chọn các phần bạn muốn khôi phục:
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { key: 'email', label: 'Email', icon: Mail },
                    { key: 'telegram', label: 'Telegram', icon: MessageSquare },
                  ].map((section) => {
                    const isSelected = resetSections[section.key];
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.key}
                        onClick={() => setResetSections({ ...resetSections, [section.key]: !isSelected })}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer ${isSelected
                          ? 'bg-primary/5 border-primary shadow-sm'
                          : 'bg-muted/30 border-border hover:border-primary/30'
                          }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                          {section.label}
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <Check className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleReset}
                    disabled={saving || Object.values(resetSections).every(v => !v)}
                    className="w-full py-4 bg-destructive text-destructive-foreground rounded-2xl font-bold shadow-lg shadow-destructive/20 hover:bg-destructive-dark transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer text-sm"
                  >
                    {saving ? 'Đang xử lý...' : 'Xác nhận Reset'}
                  </button>
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="w-full py-4 bg-muted text-foreground rounded-2xl font-bold hover:bg-muted-foreground/10 transition-all active:scale-[0.98] cursor-pointer text-sm"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
