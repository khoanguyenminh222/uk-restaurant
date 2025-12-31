'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    categories: 0,
    food: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [categoriesRes, foodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/food'),
      ]);

      const categoriesData = await categoriesRes.json();
      const foodData = await foodRes.json();

      setStats({
        categories: categoriesData.success ? categoriesData.data.length : 0,
        food: foodData.success ? foodData.data.length : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-card-foreground mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/admin/categories"
          className="bg-card rounded-lg p-6 hover:bg-muted transition-colors border border-border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Tổng danh mục</p>
              <p className="text-3xl font-bold text-card-foreground">{stats.categories}</p>
            </div>
            <div className="text-4xl">📁</div>
          </div>
        </Link>

        <Link
          href="/admin/food"
          className="bg-card rounded-lg p-6 hover:bg-muted transition-colors border border-border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Tổng món ăn</p>
              <p className="text-3xl font-bold text-card-foreground">{stats.food}</p>
            </div>
            <div className="text-4xl">🍽️</div>
          </div>
        </Link>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/categories"
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors"
          >
            Quản lý Danh mục
          </Link>
          <Link
            href="/admin/food"
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors"
          >
            Quản lý Món ăn
          </Link>
        </div>
      </div>
    </div>
  );
}

