import React, { useState } from 'react';
import { Search, Loader2, Calendar, Filter, ChevronDown, User, Tag, ChevronUp, XCircle } from 'lucide-react';

export default function OrderFilter({
    searchTerm,
    setSearchTerm,
    handleSearch,
    searching,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    statusFilter,
    setStatusFilter,
    customerTypeFilter,
    setCustomerTypeFilter,
    discountFilter,
    setDiscountFilter,
    setPagination,
    STATUS_OPTIONS
}) {
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Count active filters
    const activeFiltersCount = [
        dateFrom || dateTo,
        statusFilter !== 'all',
        customerTypeFilter !== 'all',
        discountFilter !== 'all'
    ].filter(Boolean).length;

    const clearAllFilters = () => {
        setDateFrom('');
        setDateTo('');
        setStatusFilter('all');
        setCustomerTypeFilter('all');
        setDiscountFilter('all');
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <div className="bg-card rounded-xl border border-border p-3 sm:p-4 space-y-3 sm:space-y-4 shadow-sm">
            {/* Search Row */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="flex-1 flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Mã đơn, tên KH, SĐT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-sm sm:text-base text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>

                    {/* Compact Filter Toggle (Mobile only) */}
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${showMobileFilters || activeFiltersCount > 0
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-muted/30 border-border text-muted-foreground'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        {activeFiltersCount > 0 && (
                            <span className="flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full">
                                {activeFiltersCount}
                            </span>
                        )}
                        {showMobileFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                </div>

                <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="w-full sm:w-auto px-6 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-all font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                    {searching ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Đang tìm...</span>
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4 sm:hidden" />
                            <span className="text-sm">Tìm kiếm</span>
                        </>
                    )}
                </button>
            </div>

            {/* Collapsible Filters Section */}
            <div className={`${showMobileFilters ? 'flex' : 'hidden'} sm:flex flex-col gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-none border-border animate-in slide-in-from-top-2 duration-200`}>
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                    {/* Date Filters Group */}
                    <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-4">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full pl-9 sm:pl-10 pr-2 sm:pr-4 py-2 bg-muted/30 border border-border rounded-lg text-xs sm:text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full pl-9 sm:pl-10 pr-2 sm:pr-4 py-2 bg-muted/30 border border-border rounded-lg text-xs sm:text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    {/* Clear Button (Mobile only inside grid if needed, but better separate) */}
                    {(dateFrom || dateTo) && (
                        <button
                            onClick={() => {
                                setDateFrom('');
                                setDateTo('');
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="sm:hidden w-full py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive flex items-center justify-center gap-1"
                        >
                            <XCircle className="w-3 h-3" /> Xóa lọc ngày
                        </button>
                    )}

                    {/* Select Filters Group */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full pl-9 sm:pl-10 pr-8 py-2 bg-muted/30 border border-border rounded-lg text-xs sm:text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                            >
                                {STATUS_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                        </div>

                        {/* Customer Type Filter */}
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <select
                                value={customerTypeFilter}
                                onChange={(e) => {
                                    setCustomerTypeFilter(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full pl-9 sm:pl-10 pr-8 py-2 bg-muted/30 border border-border rounded-lg text-xs sm:text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                            >
                                <option value="all">Tất cả khách</option>
                                <option value="logged_in">Thành viên</option>
                                <option value="guest">Khách vãng lai</option>
                                <option value="direct">Bán trực tiếp</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                        </div>

                        {/* Discount Filter */}
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <select
                                value={discountFilter}
                                onChange={(e) => {
                                    setDiscountFilter(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full pl-9 sm:pl-10 pr-8 py-2 bg-muted/30 border border-border rounded-lg text-xs sm:text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                            >
                                <option value="all">Tất cả đơn</option>
                                <option value="discounted">Giảm giá</option>
                                <option value="standard">Nguyên giá</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Reset All Filters Button (Mobile only) */}
                {activeFiltersCount > 0 && (
                    <button
                        onClick={clearAllFilters}
                        className="sm:hidden w-full py-2 text-xs font-bold text-destructive hover:bg-destructive/5 border border-dashed border-destructive/30 rounded-lg flex items-center justify-center gap-2"
                    >
                        <Tag className="w-3 h-3" /> Thiết lập lại bộ lọc
                    </button>
                )}
            </div>
        </div>
    );
}
