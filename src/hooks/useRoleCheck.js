'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook để kiểm tra role và redirect nếu không có quyền
 * @param {string[]} allowedRoles - Danh sách các role được phép truy cập
 * @param {string} redirectTo - URL để redirect nếu không có quyền (mặc định: /admin/dashboard)
 * @returns {object} { isAuthorized, isChecking, currentAdmin }
 */
export function useRoleCheck(allowedRoles = [], redirectTo = '/admin/dashboard') {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState(null);

  // Normalize allowedRoles so the effect dependency is stable even if callers pass inline arrays
  const allowedRolesKey = useMemo(() => allowedRoles.join(','), [allowedRoles]);

  useEffect(() => {
    try {
      const adminData = localStorage.getItem('admin_data');
      if (adminData) {
        const admin = JSON.parse(adminData);
        
        // Check if admin role is in allowed roles
        if (allowedRoles.includes(admin.role)) {
          setIsAuthorized(true);
          setCurrentAdmin(admin);
        } else {
          // Not authorized, redirect
          router.push(redirectTo);
        }
      } else {
        // No admin data, redirect to login
        router.push('/admin');
      }
    } catch (e) {
      console.error('Error checking admin role:', e);
      router.push('/admin');
    } finally {
      setIsChecking(false);
    }
  }, [allowedRolesKey, redirectTo, router]);

  return { isAuthorized, isChecking, currentAdmin };
}

