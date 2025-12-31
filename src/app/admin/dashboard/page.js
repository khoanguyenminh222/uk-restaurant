'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, FolderOpen, UtensilsCrossed, Loader2, ArrowRight } from 'lucide-react';

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
      <div className="flex items-center gap-3">
        <LayoutDashboard className="w-8 h-8 text-primary" />
        <h1 className="text-2xl lg:text-3xl font-bold text-card-foreground">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        <Link
          href="/admin/categories"
          className="bg-card rounded-lg p-6 hover:bg-muted transition-all duration-200 border border-border hover:border-primary/50 hover:shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-muted-foreground text-sm mb-2">Tổng danh mục</p>
              <p className="text-3xl font-bold text-card-foreground">{stats.categories}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <FolderOpen className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-primary group-hover:gap-3 transition-all">
            <span>Xem chi tiết</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/admin/food"
          className="bg-card rounded-lg p-6 hover:bg-muted transition-all duration-200 border border-border hover:border-primary/50 hover:shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-muted-foreground text-sm mb-2">Tổng món ăn</p>
              <p className="text-3xl font-bold text-card-foreground">{stats.food}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <UtensilsCrossed className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-primary group-hover:gap-3 transition-all">
            <span>Xem chi tiết</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/categories"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Quản lý Danh mục</span>
          </Link>
          <Link
            href="/admin/food"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Quản lý Món ăn</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

