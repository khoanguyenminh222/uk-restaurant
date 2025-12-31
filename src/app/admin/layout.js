'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);

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

  // Only show "Quản lý Admin" menu for super_admin
  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/categories', label: 'Danh mục', icon: '📁' },
    { href: '/admin/food', label: 'Món ăn', icon: '🍽️' },
    ...(adminInfo && adminInfo.role === 'super_admin' 
      ? [{ href: '/admin/admins', label: 'Quản lý Admin', icon: '👥' }]
      : []
    ),
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-10">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">UK Restaurant</h1>
          <p className="text-sm text-gray-400">Admin Panel</p>
          {adminInfo && (
            <div className="mt-3 pt-3 border-t border-gray-800">
              <p className="text-xs text-gray-500">Đăng nhập bởi</p>
              <p className="text-sm text-gray-300 font-medium">{adminInfo.name}</p>
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

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Về trang chủ</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

