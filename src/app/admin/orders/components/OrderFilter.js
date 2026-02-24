import { Search, Loader2, Calendar, Filter, ChevronDown, User } from 'lucide-react';

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
    setPagination,
    STATUS_OPTIONS
}) {
    return (
        <div className="bg-card rounded-lg border border-border p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Tìm theo Order ID, tên KH, SĐT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {searching ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang tìm...</span>
                        </>
                    ) : (
                        'Tìm kiếm'
                    )}
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                {/* Date From */}
                <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Từ ngày"
                    />
                </div>

                {/* Date To */}
                <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                            setDateTo(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Đến ngày"
                    />
                </div>

                {/* Clear Date Filter Button */}
                {(dateFrom || dateTo) && (
                    <button
                        onClick={() => {
                            setDateFrom('');
                            setDateTo('');
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium whitespace-nowrap cursor-pointer"
                    >
                        Xóa lọc ngày
                    </button>
                )}

                {/* Status Filter */}
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="pl-10 pr-8 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                    >
                        {STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Customer Type Filter */}
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select
                        value={customerTypeFilter}
                        onChange={(e) => {
                            setCustomerTypeFilter(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="pl-10 pr-8 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                    >
                        <option value="all">Tất cả KH</option>
                        <option value="logged_in">Đã đăng nhập</option>
                        <option value="guest">Vãng lai</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
