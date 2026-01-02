'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Menu, X, LayoutDashboard, FolderOpen, UtensilsCrossed, Users, LogOut, ShoppingCart, UserCircle, Image as ImageIcon, TrendingUp } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const adminData = localStorage.getItem('admin_data');
      const loggedIn = localStorage.getItem('admin_logged_in');
      
      if (loggedIn === 'true' && adminData) {
        try {
          const admin = JSON.parse(adminData);
          // Check if user is admin or super_admin
          if (admin.role === 'admin' || admin.role === 'super_admin') {
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

  const handleLogout = () => {
    localStorage.removeItem('admin_data');
    localStorage.removeItem('admin_logged_in');
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
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
    { href: '/admin/banners', label: 'Banner', icon: ImageIcon },
    { href: '/admin/categories', label: 'Danh mục', icon: FolderOpen },
    { href: '/admin/food', label: 'Món ăn', icon: UtensilsCrossed },
    { href: '/admin/popular-config', label: 'Cấu hình Ngưỡng', icon: TrendingUp },
    { href: '/admin/users', label: 'Người dùng', icon: UserCircle },
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
            <h1 className="text-lg font-bold text-card-foreground">UK Restaurant</h1>
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
        className={`fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-card-foreground">UK Restaurant</h1>
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
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
              }`}>
                {adminInfo.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          )}
        </div>

        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
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

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border space-y-2 bg-card">
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

