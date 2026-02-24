import { X, CheckCircle2, Loader2 } from 'lucide-react';

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    message,
    title = 'Xác nhận',
    isConfirming = false,
    modalRef
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div
                ref={modalRef}
                className="bg-card rounded-xl max-w-md w-full relative shadow-2xl border border-border animate-in fade-in zoom-in duration-200"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-card-foreground">{title}</h2>
                        <button
                            onClick={onClose}
                            disabled={isConfirming}
                            className="p-1 text-muted-foreground hover:text-card-foreground rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-muted-foreground mb-8">
                        {message}
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isConfirming}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isConfirming}
                            className="px-6 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50"
                        >
                            {isConfirming ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Xác nhận</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CancelReasonModal({
    isOpen,
    onClose,
    onConfirm,
    cancelReason,
    setCancelReason,
    modalRef
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[65] p-4">
            <div
                ref={modalRef}
                className="bg-card rounded-xl max-w-md w-full relative shadow-2xl border border-border animate-in fade-in zoom-in duration-200"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                            <span className="text-destructive">Lý do hủy đơn</span>
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 text-muted-foreground hover:text-card-foreground rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Vui lòng nhập lý do hủy đơn hàng này để khách hàng và các admin khác cùng biết.
                    </p>
                    <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-6"
                        rows={4}
                        placeholder="Nhập lý do hủy (không bắt buộc)..."
                    />
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors"
                        >
                            Bỏ qua
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-6 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-semibold flex items-center gap-2 shadow-sm"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Xác nhận hủy</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
