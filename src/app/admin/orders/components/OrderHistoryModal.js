import { History, X, Clock, CheckCircle2, Package, Truck, CheckCircle, XCircle, User, ArrowRight, Tag, Phone, MapPin, DollarSign, MessageSquare } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/helpers';

const STATUS_CONFIG = {
    pending: { label: 'Chờ xử lý', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Clock },
    confirmed: { label: 'Đã xác nhận', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: CheckCircle2 },
    preparing: { label: 'Đang chuẩn bị', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: Package },
    ready: { label: 'Sẵn sàng', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle },
    delivered: { label: 'Đã giao', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: Truck },
    completed: { label: 'Hoàn thành', color: 'bg-green-600/10 text-green-700 border-green-600/20', icon: CheckCircle2 },
    cancelled: { label: 'Đã hủy', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
    deleted: { label: 'Đã xóa', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
};

const FIELD_LABELS = {
    customer_name: { label: 'Tên khách', icon: User },
    customer_phone: { label: 'SĐT', icon: Phone },
    customer_address: { label: 'Địa chỉ', icon: MapPin },
    total_price: { label: 'Tổng tiền', icon: DollarSign },
    status: { label: 'Trạng thái', icon: Tag },
    admin_notes: { label: 'Ghi chú', icon: MessageSquare },
    items: { label: 'Món ăn', icon: Package },
};

export default function OrderHistoryModal({
    isOpen,
    onClose,
    order,
    modalRef
}) {
    if (!isOpen || !order) return null;

    const timeline = [];

    // Process detailed changes first
    const detailEntries = [];
    if (order.change_history) {
        order.change_history.forEach(item => {
            const entry = { ...item, timestamp: new Date(item.changed_at), type: 'detail' };
            detailEntries.push(entry);
            timeline.push(entry);
        });
    }

    // Process status history, filtering out those already covered by detail entries
    if (order.status_history) {
        order.status_history.forEach(item => {
            const timestamp = new Date(item.changed_at);

            // Skip if there's a detail entry at the exact same time (common for new actions)
            const isCovered = detailEntries.some(d =>
                Math.abs(d.timestamp.getTime() - timestamp.getTime()) < 1000 &&
                d.changed_by === item.changed_by
            );

            if (!isCovered) {
                timeline.push({ ...item, timestamp, type: 'status' });
            }
        });
    }

    const sortedTimeline = timeline.sort((a, b) => b.timestamp - a.timestamp);

    const renderVal = (field, value) => {
        if (value === null || value === undefined || value === '') return <span className="opacity-40 italic">trống</span>;
        if (field === 'status') {
            const cfg = STATUS_CONFIG[value];
            return cfg ? <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span> : value;
        }
        if (field === 'total_price') return <span className="font-bold text-primary">{formatCurrency(value)}</span>;
        return <span className="text-card-foreground">{String(value)}</span>;
    };

    const getItemDiff = (oldR, newR) => {
        try {
            const oldI = typeof oldR === 'string' ? JSON.parse(oldR) : (oldR || []);
            const newI = typeof newR === 'string' ? JSON.parse(newR) : (newR || []);
            const added = newI.filter(n => !oldI.find(o => o.food_id === n.food_id));
            const removed = oldI.filter(o => !newI.find(n => n.food_id === o.food_id));
            const changed = newI.filter(n => {
                const old = oldI.find(o => o.food_id === n.food_id);
                return old && (old.quantity !== n.quantity || old.price !== n.price);
            }).map(n => {
                const old = oldI.find(o => o.food_id === n.food_id);
                return { name: n.name, oldQ: old.quantity, newQ: n.quantity, oldP: old.price, newP: n.price };
            });
            return { added, removed, changed };
        } catch (e) { return null; }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
            <div ref={modalRef} className="bg-card rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-border overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/10">
                    <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-card-foreground">Lịch sử đơn #{order.order_id}</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {sortedTimeline.length > 0 ? (
                        <div className="relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                            {sortedTimeline.map((entry, idx) => {
                                const isAdmin = entry.changed_by === 'admin';
                                const changer = entry.changed_by_detail?.name || (isAdmin ? 'Admin' : (entry.changed_by === 'user' ? 'Khách' : 'Hệ thống'));

                                // Identify if this is a status entry or a detail entry containing a status change
                                const statusChange = entry.type === 'status' ? entry.status : entry.changes?.find(c => c.field === 'status')?.new_value;
                                const statusCfg = statusChange ? STATUS_CONFIG[statusChange] : null;

                                return (
                                    <div key={idx} className="relative pl-10 pb-8 last:pb-0">
                                        {/* Timeline Point */}
                                        <div className={`absolute left-0 top-0.5 w-9 h-9 rounded-full border-2 border-background flex items-center justify-center z-10 shadow-sm ${statusCfg ? statusCfg.color : 'bg-muted text-muted-foreground'}`}>
                                            {statusCfg ?
                                                (() => { const Icon = statusCfg.icon; return <Icon className="w-4 h-4" /> })() :
                                                <div className="w-2 h-2 rounded-full bg-current opacity-40" />
                                            }
                                        </div>

                                        {/* Entry Content */}
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-card-foreground">{changer}</span>
                                                    {entry.changed_by_detail?.role && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold">{entry.changed_by_detail.role}</span>}
                                                </div>
                                                <span className="text-xs text-muted-foreground font-medium">{formatDate(entry.timestamp)}</span>
                                            </div>

                                            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                                                {entry.type === 'detail' && entry.changes ? (
                                                    <div className="space-y-2">
                                                        {entry.changes.map((ch, cIdx) => {
                                                            if (ch.field === 'items') {
                                                                const diff = getItemDiff(ch.old_value, ch.new_value);
                                                                return diff && (
                                                                    <div key={cIdx} className="space-y-1">
                                                                        <span className="text-xs font-bold text-muted-foreground block border-b border-border/50 pb-1 mb-1">Cập nhật món ăn:</span>
                                                                        {diff.added.map((it, i) => <div key={`a-${i}`} className="text-xs text-green-600 font-medium">+ Thêm: {it.name} (x{it.quantity})</div>)}
                                                                        {diff.removed.map((it, i) => <div key={`r-${i}`} className="text-xs text-red-500 font-medium">- Xóa: {it.name}</div>)}
                                                                        {diff.changed.map((it, i) => (
                                                                            <div key={`c-${i}`} className="text-xs text-blue-600 font-medium flex flex-wrap gap-x-2">
                                                                                <span>~ {it.name}:</span>
                                                                                {it.oldQ !== it.newQ && <span>SL {it.oldQ} → {it.newQ}</span>}
                                                                                {it.oldP !== it.newP && <span>{formatCurrency(it.oldP)} → {formatCurrency(it.newP)}</span>}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            }
                                                            if (ch.field === 'status') {
                                                                return (
                                                                    <div key={cIdx} className="flex items-center gap-2 py-0.5">
                                                                        <span className="text-xs font-bold text-muted-foreground mr-1">Trạng thái:</span>
                                                                        {renderVal('status', ch.new_value)}
                                                                    </div>
                                                                );
                                                            }

                                                            const label = FIELD_LABELS[ch.field]?.label || ch.field;
                                                            return (
                                                                <div key={cIdx} className="text-sm">
                                                                    <span className="text-xs font-bold text-muted-foreground">{label}: </span>
                                                                    <div className="flex items-center gap-2 mt-0.5 pl-2 border-l-2 border-primary/20">
                                                                        <div className="text-xs">{renderVal(ch.field, ch.old_value)}</div>
                                                                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                                                        <div className="text-xs">{renderVal(ch.field, ch.new_value)}</div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-muted-foreground">Đổi trạng thái:</span>
                                                        {renderVal('status', entry.status)}
                                                    </div>
                                                )}

                                                {(entry.note || entry.admin_notes || entry.cancel_reason) && (
                                                    <div className="mt-2 pt-2 border-t border-border/50 text-xs italic text-card-foreground/70">
                                                        &quot;{entry.note || entry.admin_notes || entry.cancel_reason}&quot;
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                            <History className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm">Chưa có lịch sử thay đổi</p>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-border bg-muted/5 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 bg-muted hover:bg-muted-dark rounded-lg font-bold text-sm transition-colors cursor-pointer">Đóng</button>
                </div>
            </div>
        </div>
    );
}
