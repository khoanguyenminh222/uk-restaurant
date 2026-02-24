import React, { useState } from 'react';
import { Plus, X, Search, Package, User, ShoppingCart, Minus, Loader2, CheckCircle2, Tag } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

export default function OrderAddModal({
    isOpen,
    onClose,
    allFoods,
    categories,
    selectedCategory,
    setSelectedCategory,
    foodSearchTerm,
    setFoodSearchTerm,
    editingItems,
    setEditingItems,
    editingTotalPrice,
    setEditingTotalPrice,
    editingCustomerName,
    setEditingCustomerName,
    editingCustomerPhone,
    setEditingCustomerPhone,
    editingCustomerAddress,
    setEditingCustomerAddress,
    customerEmail,
    setCustomerEmail,
    editingAdminNotes,
    setEditingAdminNotes,
    editingStatus,
    setEditingStatus,
    STATUS_OPTIONS,
    isSaving,
    onSave,
    discountPercent,
    setDiscountPercent,
}) {
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'cart'

    if (!isOpen) return null;

    const addItemToOrder = (food) => {
        const existingItemIndex = editingItems.findIndex(item => item.food_id === food.id);
        let newItems = [...editingItems];
        if (existingItemIndex > -1) {
            newItems[existingItemIndex].quantity += 1;
        } else {
            newItems.push({
                food_id: food.id,
                name: food.name,
                price: food.price,
                quantity: 1,
                category_id: food.category_id,
                category_name: food.category_name
            });
        }
        setEditingItems(newItems);
        const subtotal = newItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
        const disc = Math.min(Math.max(discountPercent || 0, 0), 100);
        setEditingTotalPrice(Math.round(subtotal * (1 - disc / 100)));
        setFoodSearchTerm('');
    };

    const removeItem = (index) => {
        const newItems = editingItems.filter((_, i) => i !== index);
        setEditingItems(newItems);
        const subtotal = newItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
        const disc = Math.min(Math.max(discountPercent || 0, 0), 100);
        setEditingTotalPrice(Math.round(subtotal * (1 - disc / 100)));
    };

    const updateQuantity = (index, delta) => {
        const newItems = [...editingItems];
        if (newItems[index].quantity + delta > 0) {
            newItems[index].quantity += delta;
            setEditingItems(newItems);
            const subtotal = newItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
            const disc = Math.min(Math.max(discountPercent || 0, 0), 100);
            setEditingTotalPrice(Math.round(subtotal * (1 - disc / 100)));
        }
    };

    const updatePrice = (index, newPrice) => {
        const newItems = [...editingItems];
        newItems[index].price = parseInt(newPrice) || 0;
        setEditingItems(newItems);
        const subtotal = newItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
        const disc = Math.min(Math.max(discountPercent || 0, 0), 100);
        setEditingTotalPrice(Math.round(subtotal * (1 - disc / 100)));
    };

    const applyDiscount = (newDiscount) => {
        const disc = Math.min(Math.max(newDiscount || 0, 0), 100);
        setDiscountPercent(disc);
        const subtotal = editingItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
        setEditingTotalPrice(Math.round(subtotal * (1 - disc / 100)));
    };

    const subtotal = editingItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);

    return (
        <div className="fixed inset-0 bg-background z-[100] flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-card">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg text-primary">
                        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Tạo đơn mới</h2>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="px-4 sm:px-6 py-1.5 sm:py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        <span>Lưu đơn</span>
                    </button>
                </div>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="lg:hidden flex border-b border-border bg-card">
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'menu' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                >
                    1. Chọn món
                </button>
                <button
                    onClick={() => setActiveTab('cart')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'cart' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                >
                    2. Giỏ hàng & Thông tin ({editingItems.length})
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Column: Dish Selection */}
                <div className={`${activeTab === 'menu' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[65%] flex-col bg-muted/20 lg:border-r border-border h-full overflow-hidden`}>
                    <div className="p-4 space-y-4 bg-card shadow-sm z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm món ăn theo tên hoặc mã..."
                                value={foodSearchTerm}
                                onChange={(e) => setFoodSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-base"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide py-1">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${selectedCategory === 'all'
                                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                    : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                                    }`}
                            >
                                Tất cả
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${selectedCategory === cat.id
                                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                        : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-4">
                            {allFoods
                                .filter(food => {
                                    const matchesSearch = food.name.toLowerCase().includes(foodSearchTerm.toLowerCase());
                                    const matchesCategory = selectedCategory === 'all' || food.category_id === selectedCategory;
                                    return matchesSearch && matchesCategory;
                                })
                                .map(food => {
                                    const inOrder = editingItems.find(item => item.food_id === food.id);
                                    return (
                                        <div
                                            key={food.id}
                                            onClick={() => addItemToOrder(food)}
                                            className={`relative flex flex-col bg-card rounded-lg sm:rounded-xl border border-border sm:border-2 overflow-hidden cursor-pointer transition-all active:scale-95 lg:hover:shadow-xl lg:hover:-translate-y-1 group ${inOrder ? 'border-primary shadow-md ring-1 ring-primary/20' : 'shadow-sm'}`}
                                        >
                                            <div className="aspect-[16/10] sm:aspect-[4/3] bg-muted relative">
                                                {food.image ? (
                                                    <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        <Package className="w-6 h-6 sm:w-8 sm:h-8 opacity-20" />
                                                    </div>
                                                )}
                                                {inOrder && (
                                                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-primary text-primary-foreground w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-bold shadow-lg animate-in zoom-in duration-300">
                                                        {inOrder.quantity}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-1.5 sm:p-3">
                                                <h4 className="font-bold text-[11px] sm:text-sm text-card-foreground line-clamp-2 leading-tight h-7 sm:h-10 group-hover:text-primary transition-colors">
                                                    {food.name}
                                                </h4>
                                                <div className="flex items-center justify-between mt-1 sm:mt-2">
                                                    <span className="text-primary font-bold text-[10px] sm:text-sm">
                                                        {formatCurrency(food.price)}
                                                    </span>
                                                    <div className="p-1 bg-primary/10 rounded-md sm:rounded-lg text-primary lg:group-hover:bg-primary lg:group-hover:text-primary-foreground transition-all">
                                                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Info */}
                <div className={`${activeTab === 'cart' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[35%] flex-col bg-card h-full lg:shadow-2xl relative z-10 overflow-hidden`}>
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-border bg-muted/5">
                            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 text-card-foreground">
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                Thông tin khách hàng
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Họ tên khách <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={editingCustomerName}
                                            onChange={(e) => setEditingCustomerName(e.target.value)}
                                            className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="Tên khách hàng"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={editingCustomerPhone}
                                            onChange={(e) => setEditingCustomerPhone(e.target.value)}
                                            className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="Số điện thoại"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Địa chỉ email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Địa chỉ giao hàng</label>
                                    <textarea
                                        value={editingCustomerAddress}
                                        onChange={(e) => setEditingCustomerAddress(e.target.value)}
                                        className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                        rows={1}
                                        placeholder="Nơi nhận hàng"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-muted/10 border-b border-border">
                                <h3 className="text-sm sm:font-bold flex items-center gap-2 text-card-foreground">
                                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                    Giỏ hàng ({editingItems.length})
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {editingItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 space-y-2">
                                        <ShoppingCart className="w-12 h-12 mb-2" />
                                        <p className="text-sm">Vui lòng chọn món để thêm vào đơn</p>
                                    </div>
                                ) : (
                                    editingItems.map((item, index) => (
                                        <div key={index} className="bg-card rounded-xl border border-border p-3 shadow-sm group hover:border-primary/30 transition-all">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-card-foreground mb-1 leading-tight">{item.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => updatePrice(index, e.target.value)}
                                                            className="w-24 bg-transparent border-none p-0 text-xs text-primary font-medium focus:outline-none focus:ring-0"
                                                        />
                                                        <span className="text-[10px] text-muted-foreground italic">(Sửa giá món)</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeItem(index)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border">
                                                    <button onClick={() => updateQuantity(index, -1)} className="p-1 px-2 hover:bg-card hover:text-primary rounded-md transition-all font-bold">
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="px-3 text-sm font-bold min-w-[32px] text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(index, 1)} className="p-1 px-2 hover:bg-card hover:text-primary rounded-md transition-all font-bold">
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <p className="font-bold text-primary">
                                                    {formatCurrency((item.price || 0) * (item.quantity || 1))}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 bg-muted/20 border-t border-border space-y-3 sm:space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Trạng thái ban đầu</label>
                                    <select
                                        value={editingStatus}
                                        onChange={(e) => setEditingStatus(e.target.value)}
                                        className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {STATUS_OPTIONS.filter(opt => opt.value !== 'all').map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> Giảm giá (%)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={discountPercent || ''}
                                            onChange={(e) => applyDiscount(Number(e.target.value))}
                                            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="0"
                                        />
                                        <span className="text-sm font-bold text-muted-foreground">%</span>
                                    </div>
                                </div>
                            </div>
                            {discountPercent > 0 && (
                                <div className="flex items-center justify-between text-sm bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                                    <span className="text-muted-foreground">Giá gốc: <span className="line-through">{formatCurrency(subtotal)}</span></span>
                                    <span className="text-green-600 font-bold">Giảm {discountPercent}% → {formatCurrency(editingTotalPrice)}</span>
                                </div>
                            )}
                            {discountPercent === 0 && (
                                <div className="flex items-center justify-end">
                                    <span className="text-xl font-extrabold text-primary">{formatCurrency(editingTotalPrice)}</span>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Ghi chú cho đơn hàng này</label>
                                <textarea
                                    value={editingAdminNotes}
                                    onChange={(e) => setEditingAdminNotes(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    placeholder="Thêm lưu ý về đơn hàng (nếu có)..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
