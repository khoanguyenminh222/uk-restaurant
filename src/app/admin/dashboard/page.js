'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Filter,
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { adminFetch } from '@/lib/adminAuth';
import Toast from '@/components/Toast/Toast';
import { formatCurrency } from '@/utils/helpers';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topFood, setTopFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed']);
  const now = new Date();
  const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('sv-SE');
  const lastDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString('sv-SE');

  const [dateRange, setDateRange] = useState({
    from: firstDayOfCurrentMonth,
    to: lastDayOfCurrentMonth
  });
  const [toast, setToast] = useState({ message: "", isVisible: false, type: "success" });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const allStatusOptions = [
    { value: 'pending', label: 'Chờ xử lý', color: 'bg-yellow-500' },
    { value: 'confirmed', label: 'Đã xác nhận', color: 'bg-blue-500' },
    { value: 'preparing', label: 'Đang chuẩn bị', color: 'bg-orange-500' },
    { value: 'ready', label: 'Sẵn sàng', color: 'bg-green-500' },
    { value: 'delivered', label: 'Đã giao', color: 'bg-emerald-500' },
    { value: 'completed', label: 'Hoàn thành', color: 'bg-green-600' },
    { value: 'cancelled', label: 'Đã hủy', color: 'bg-red-500' },
    { value: 'deleted', label: 'Đã xóa', color: 'bg-gray-500' },
  ];

  useEffect(() => {
    setIsClient(true);
    fetchDashboardData();

    const loginMessage = localStorage.getItem('admin_login_success_message');
    if (loginMessage) {
      setToast({ message: loginMessage, isVisible: true, type: 'success' });
      localStorage.removeItem('admin_login_success_message');
    }
  }, []);

  const fetchDashboardData = async (range = dateRange, statuses = selectedStatuses) => {
    setLoading(true);
    try {
      const statusParam = statuses.join(',');
      const [summaryRes, revenueRes, foodRes] = await Promise.all([
        adminFetch(`/api/admin/reports/summary?from=${range.from}&to=${range.to}&rev_status=${statusParam}`),
        adminFetch(`/api/admin/reports/revenue?from=${range.from}&to=${range.to}&rev_status=${statusParam}`),
        adminFetch(`/api/admin/reports/top-food?from=${range.from}&to=${range.to}&rev_status=${statusParam}`)
      ]);

      const summaryData = await summaryRes.json();
      const revenueResults = await revenueRes.json();
      const foodResults = await foodRes.json();

      if (summaryData.success) setSummary(summaryData.data);
      if (revenueResults.success) setRevenueData(revenueResults.data);
      if (foodResults.success) setTopFood(foodResults.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
      setToast({ message: "Lỗi khi tải dữ liệu dashboard", isVisible: true, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchDashboardData();
  };

  const toggleStatus = (status) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-muted-foreground">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueTrend = summary ? calculateTrend(summary.today.revenue, summary.yesterday.revenue) : 0;
  const ordersTrend = summary ? calculateTrend(summary.today.orders, summary.yesterday.orders) : 0;

  const StatCard = ({ title, value, subValue, icon: Icon, trend, color, href }) => (
    <div className="bg-card rounded-xl p-3 sm:p-6 border border-border hover:shadow-md transition-all h-full flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate mb-0.5 sm:mb-1" title={title}>{title}</p>
          <h3 className="text-sm sm:text-2xl font-bold text-card-foreground break-all line-clamp-1">{value}</h3>
          {(trend !== undefined && trend !== null) && (
            <div className={`flex items-center mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 sm:w-3 h-3 mr-0.5" />}
              <span className="truncate">{Math.abs(trend).toFixed(1)}% <span className="hidden min-[380px]:inline">so với qua</span></span>
            </div>
          )}
          {subValue && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2 truncate" title={subValue}>{subValue}</p>
          )}
        </div>
        <div className={`p-1.5 sm:p-3 rounded-lg ${color} shrink-0`}>
          <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
        </div>
      </div>
      {href && (
        <Link href={href} className="mt-2 sm:mt-4 flex items-center text-[10px] sm:text-xs text-primary hover:underline group">
          Xem chi tiết
          <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      )}
    </div>
  );

  const filterSummary = `Từ ${dateRange.from.split('-').reverse().join('/')} đến ${dateRange.to.split('-').reverse().join('/')} | ${selectedStatuses.length} trạng thái`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LayoutDashboard className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-card-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Tổng quan hoạt động</p>
          </div>
        </div>

        {/* Mobile Filter Toggle & Date Info */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
            <Calendar className="w-3.5 h-3.5" />
            <span>{filterSummary}</span>
          </div>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20 text-xs font-bold transition-all active:scale-95"
          >
            <Filter className="w-3.5 h-3.5" />
            {showMobileFilters ? "Thu gọn bộ lọc" : "Điều chỉnh bộ lọc"}
          </button>
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted px-4 py-2 rounded-lg border border-border">
            <Calendar className="w-4 h-4" />
            <span>Hệ thống: {new Date().toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>

      {/* Date & Status Filters */}
      <div className={`bg-card rounded-xl border border-border shadow-sm transition-all duration-300 overflow-hidden ${showMobileFilters ? 'p-4 opacity-100 max-h-[1000px]' : 'p-0 md:p-4 md:opacity-100 max-h-0 md:max-h-[1000px]'}`}>
        <div className="flex flex-col md:flex-row items-end gap-3 md:gap-4">
          <div className="space-y-1.5 w-full md:flex-1">
            <label className="text-[10px] font-bold text-muted-foreground ml-1 flex items-center gap-1 uppercase tracking-wider">
              <Calendar className="w-3 h-3" /> Từ ngày
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="space-y-1.5 w-full md:flex-1">
            <label className="text-[10px] font-bold text-muted-foreground ml-1 flex items-center gap-1 uppercase tracking-wider">
              <Calendar className="w-3 h-3" /> Đến ngày
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-muted/30 border border-border rounded-lg p-0.5">
                <button
                  onClick={() => {
                    const current = new Date(dateRange.from);
                    const prevMonth = new Date(current.getFullYear(), current.getMonth() - 1, 1);
                    const first = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1).toLocaleDateString('sv-SE');
                    const last = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).toLocaleDateString('sv-SE');
                    const newRange = { from: first, to: last };
                    setDateRange(newRange);
                    fetchDashboardData(newRange);
                  }}
                  className="p-1 px-2 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  title="Tháng trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3 py-1 text-xs font-semibold text-primary flex items-center gap-2 border-x border-border/50">
                  <span>
                    Tháng {new Date(dateRange.from).getMonth() + 1}/{new Date(dateRange.from).getFullYear()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const current = new Date(dateRange.from);
                    const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);
                    const first = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1).toLocaleDateString('sv-SE');
                    const last = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).toLocaleDateString('sv-SE');
                    const newRange = { from: first, to: last };
                    setDateRange(newRange);
                    fetchDashboardData(newRange);
                  }}
                  className="p-1 px-2 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  title="Tháng sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  const now = new Date();
                  const first = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('sv-SE');
                  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString('sv-SE');
                  const newRange = { from: first, to: last };
                  setDateRange(newRange);
                  fetchDashboardData(newRange);
                }}
                className="px-2 py-2 text-[10px] sm:text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors cursor-pointer"
              >
                Hiện tại
              </button>
            </div>
            <button
              onClick={handleFilter}
              className="w-full px-8 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-all font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <Filter className="w-4 h-4" />
              <span>Lọc dữ liệu</span>
            </button>
          </div>
        </div>

        {/* Status Multi-select */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-bold text-muted-foreground ml-1 flex items-center gap-1 uppercase tracking-wider">
              TRẠNG THÁI TÍNH DOANH THU
            </label>
            <button
              onClick={() => setSelectedStatuses(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed'])}
              className="text-[10px] text-primary hover:underline font-bold"
            >
              Mặc định
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {allStatusOptions.map(status => (
              <button
                key={status.value}
                onClick={() => toggleStatus(status.value)}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all flex items-center gap-2 border ${selectedStatuses.includes(status.value)
                  ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:border-border'
                  }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                {status.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 italic leading-relaxed">
            * Các trạng thái được chọn sẽ dùng để tính doanh thu và vẽ biểu đồ.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-4">
        {/* Today's Stats */}
        <StatCard
          title="Doanh thu hôm nay"
          value={formatCurrency(summary?.today.revenue || 0)}
          icon={DollarSign}
          trend={revenueTrend}
          color="bg-green-500/10 text-green-600"
        />
        <StatCard
          title="Đơn hàng hôm nay"
          value={summary?.today.orders || 0}
          icon={ShoppingCart}
          trend={ordersTrend}
          color="bg-blue-500/10 text-blue-600"
          href={`/admin/orders?date_from=${new Date().toLocaleDateString('sv-SE')}&date_to=${new Date().toLocaleDateString('sv-SE')}`}
        />

        {/* Period Stats */}
        <StatCard
          title="Doanh thu trong kỳ"
          value={formatCurrency(summary?.total.revenue || 0)}
          icon={TrendingUp}
          subValue={`Từ ${dateRange.from.split('-').reverse().join('/')}`}
          color="bg-green-500/10 text-green-600"
        />
        <StatCard
          title="Đơn hàng trong kỳ"
          value={summary?.total.orders || 0}
          icon={ShoppingCart}
          subValue="Tổng đơn theo bộ lọc"
          color="bg-blue-500/10 text-blue-600"
          href={`/admin/orders?date_from=${dateRange.from}&date_to=${dateRange.to}`}
        />
        <StatCard
          title="Chờ xử lý"
          value={summary?.total.pending || 0}
          icon={Clock}
          subValue="Số đơn hàng mới"
          color="bg-amber-500/10 text-amber-500"
          href={`/admin/orders?status=pending&date_from=${dateRange.from}&date_to=${dateRange.to}`}
        />
        <StatCard
          title="Đơn hàng giảm giá"
          value={`${summary?.total.discounted_orders || 0} / ${summary?.total.orders || 0}`}
          icon={Tag}
          subValue="Số đơn được giảm giá"
          color="bg-pink-500/10 text-pink-500"
          href={`/admin/orders?discount_filter=discounted&date_from=${dateRange.from}&date_to=${dateRange.to}`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-card-foreground">Xu hướng doanh thu</h2>
            </div>
            <div className="text-xs text-muted-foreground italic">30 ngày gần nhất</div>
          </div>

          <div className="h-[300px] w-full">
            {isClient && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => date.split('-').slice(1).reverse().join('/')}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))'
                    }}
                    formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                    labelFormatter={(label) => `Ngày: ${label.split('-').reverse().join('/')}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Biểu đồ tỉ lệ đơn hàng */}
        <div className="bg-card rounded-xl p-6 border border-border flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-card-foreground">Tỉ lệ đơn hàng</h2>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
            {isClient && summary ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Thành công', value: summary.total.success, color: '#10b981' },
                        { name: 'Đang xử lý', value: summary.total.processing, color: '#3b82f6' },
                        { name: 'Đã hủy', value: summary.total.cancelled, color: '#ef4444' },
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Thành công', color: '#10b981' },
                        { name: 'Đang xử lý', color: '#3b82f6' },
                        { name: 'Đã hủy', color: '#ef4444' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 gap-2 w-full mt-4">
                  {[
                    { label: 'Thành công', value: summary.total.success, color: 'bg-emerald-500', total: summary.total.orders, statuses: 'delivered,completed' },
                    { label: 'Đang xử lý', value: summary.total.processing, color: 'bg-blue-500', total: summary.total.orders, statuses: 'pending,confirmed,preparing,ready' },
                    { label: 'Đã hủy', value: summary.total.cancelled, color: 'bg-red-500', total: summary.total.orders, statuses: 'cancelled,deleted' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={`/admin/orders?status=${item.statuses}&date_from=${dateRange.from}&date_to=${dateRange.to}`}
                      className="flex items-center justify-between text-xs rounded-lg transition-colors group hover:underline hover:text-primary"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      <div className="font-bold flex items-center gap-1">
                        <span>{item.value} đơn ({item.total > 0 ? ((item.value / item.total) * 100).toFixed(1) : 0}%)</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Đang tải...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu chi tiết */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bảng Doanh thu theo ngày */}
        <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span>Chi tiết Doanh thu</span>
            </div>
            <div className="text-sm font-bold text-primary">
              Tổng: {formatCurrency(revenueData.reduce((acc, curr) => acc + curr.revenue, 0))}
            </div>
          </div>
          <div className="overflow-x-auto flex-1 max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3 text-center">Số đơn</th>
                  <th className="px-4 py-3 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {revenueData.filter(d => d.revenue > 0 || d.orders > 0).reverse().map((row, i) => (
                  <tr key={i} className="hover:bg-muted/10">
                    <td className="px-4 py-3 font-medium">{row.date.split('-').reverse().join('/')}</td>
                    <td className="px-4 py-3 text-center">{row.orders}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-500">{formatCurrency(row.revenue)}</td>
                  </tr>
                ))}
                {revenueData.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-4 py-10 text-center text-muted-foreground">Không có dữ liệu trong khoảng này</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bảng Món ăn bán chạy */}
        <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <ArrowUpRight className="w-5 h-5 text-blue-500" />
              <span>Món ăn bán chạy nhất</span>
            </div>
            <div className="text-sm text-muted-foreground">Top 10</div>
          </div>
          <div className="overflow-x-auto flex-1 max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Tên món / Danh mục</th>
                  <th className="px-4 py-3 text-center">SL bán</th>
                  <th className="px-4 py-3 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topFood.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/10">
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-muted-foreground">{row.category_name}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold">{row.total_quantity}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.total_revenue)}</td>
                  </tr>
                ))}
                {topFood.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-4 py-10 text-center text-muted-foreground">Không có dữ liệu món ăn</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ message: "", isVisible: false, type: "success" })}
        type={toast.type}
      />
    </div>
  );
}
