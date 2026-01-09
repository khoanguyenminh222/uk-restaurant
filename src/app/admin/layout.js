'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Menu, X, LayoutDashboard, FolderOpen, UtensilsCrossed, Users, LogOut, ShoppingCart, UserCircle, Image as ImageIcon, TrendingUp, Settings, ChevronDown, ChevronRight, Shield, Bell, BookOpen, Phone, MessageSquare } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import { useLandingConfig } from '@/hooks/useLandingConfig';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [configMenuOpen, setConfigMenuOpen] = useState(false);
  const { config } = useLandingConfig();
  const restaurantName = config?.restaurant_name || 'UK Restaurant';

  useEffect(() => {
    const checkAuth = () => {
      const adminData = localStorage.getItem('admin_data');
      const loggedIn = localStorage.getItem('admin_logged_in');

      if (loggedIn === 'true' && adminData) {
        try {
          const admin = JSON.parse(adminData);
          // Check if user is admin, manager, or super_admin
          if (admin.role === 'admin' || admin.role === 'super_admin' || admin.role === 'manager') {
            setIsLoggedIn(true);
            setAdminInfo(admin);
            return;
          }
        } catch (e) {
          // Invalid data, clear it
          localStorage.removeItem('admin_data');
          localStorage.removeItem('admin_logged_in');
        }
      }

      // Not logged in, redirect to login
      if (pathname !== '/admin') {
        router.push('/admin');
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Check if current path is in config submenu
  const isConfigPath = pathname.startsWith('/admin/banners') || 
                       pathname.startsWith('/admin/popular-config') || 
                       pathname.startsWith('/admin/landing-config') ||
                       pathname.startsWith('/admin/notification-config') ||
                       pathname.startsWith('/admin/blacklist');
  
  // Auto expand config menu if on config page
  useEffect(() => {
    if (isConfigPath) {
      setConfigMenuOpen(true);
    }
  }, [isConfigPath]);

  const handleLogout = () => {
    // Xóa admin data
    localStorage.removeItem('admin_data');
    localStorage.removeItem('admin_logged_in');
    
    // Xóa user data nếu có (trường hợp admin cũng là user)
    if (typeof window !== 'undefined') {
      try {
        const { clearUser } = require('@/utils/user');
        clearUser();
      } catch (error) {
        console.error('Error clearing user data:', error);
      }
    }
    
    router.push('/admin');
  };

  // Không hiển thị layout nếu đang ở trang login
  if (pathname === '/admin') {
    return <>{children}</>;
  }

  // Kiểm tra auth trước khi hiển thị layout
  if (!isLoggedIn) {
    return null;
  }

  // Navigation items based on role
  const navItems = [
    // Items available for all roles (manager, admin, super_admin)
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/categories', label: 'Danh mục', icon: FolderOpen },
    { href: '/admin/food', label: 'Món ăn', icon: UtensilsCrossed },
    { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
    { href: '/admin/reviews', label: 'Đánh giá', icon: MessageSquare },

    // Config menu - only for admin and super_admin (not manager)
    ...(adminInfo && (adminInfo.role === 'admin' || adminInfo.role === 'super_admin')
      ? [{
          type: 'group',
          label: 'Cấu hình',
          icon: Settings,
          isOpen: configMenuOpen,
          onToggle: () => setConfigMenuOpen(!configMenuOpen),
          children: [
            { href: '/admin/banners', label: 'Banner', icon: ImageIcon },
            { href: '/admin/landing-config', label: 'Cấu hình Home', icon: Settings },
            { href: '/admin/about-config', label: 'Cấu hình About', icon: BookOpen },
            { href: '/admin/contact-config', label: 'Cấu hình Contact', icon: Phone },
            { href: '/admin/popular-config', label: 'Cấu hình Ngưỡng', icon: TrendingUp },
            { href: '/admin/notification-config', label: 'Cấu hình Thông báo', icon: Bell },
            { href: '/admin/blacklist', label: 'Blacklist Email', icon: Shield },
          ]
        }]
      : []
    ),

    // Users - only for admin and super_admin (not manager)
    ...(adminInfo && (adminInfo.role === 'admin' || adminInfo.role === 'super_admin')
      ? [{ href: '/admin/users', label: 'Người dùng', icon: UserCircle }]
      : []
    ),

    // Admins management - only for super_admin
    ...(adminInfo && adminInfo.role === 'super_admin'
      ? [{ href: '/admin/admins', label: 'Quản lý Admin', icon: Users }]
      : []
    ),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-card-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div>
            <h1 className="text-lg font-bold text-card-foreground">{restaurantName}</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-card-foreground">{restaurantName}</h1>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
          </div>
          {adminInfo && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Đăng nhập bởi</p>
              <p className="text-sm text-card-foreground font-medium">{adminInfo.name}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                adminInfo.role === 'super_admin'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : adminInfo.role === 'admin'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-green-500/20 text-green-400 border border-green-500/50'
              }`}>
                {adminInfo.role === 'super_admin' ? 'Super Admin' : adminInfo.role === 'admin' ? 'Admin' : 'Manager'}
              </span>
            </div>
          )}
        </div>

        <nav className="p-4 flex-1 overflow-y-auto min-h-0">
          <ul className="space-y-2">
            {navItems.map((item, index) => {
              // Menu group với submenu
              if (item.type === 'group') {
                const IconComponent = item.icon;
                const hasActiveChild = item.children?.some(child => pathname === child.href);
                return (
                  <li key={`group-${index}`}>
                    <button
                      onClick={item.onToggle}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                        hasActiveChild
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.isOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {item.isOpen && item.children && (
                      <ul className="mt-1 ml-4 space-y-1 border-l-2 border-border pl-4">
                        {item.children.map((child) => {
                          const isActive = pathname === child.href;
                          const ChildIcon = child.icon;
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                                  isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
                                }`}
                              >
                                <ChildIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">{child.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }
              
              // Menu item thông thường
              const isActive = pathname === item.href;
              const IconComponent = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border space-y-2 bg-card shrink-0">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Về trang chủ</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-20 lg:pt-4 p-4 lg:p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}

