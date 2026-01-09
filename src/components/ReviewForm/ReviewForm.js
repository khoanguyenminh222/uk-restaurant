"use client"

import { useState, useEffect, useRef } from "react"
import { Star, X, Loader2, MessageSquare } from "lucide-react"
import { getUser } from "@/utils/user"
import { getCustomerInfo } from "@/utils/customer"

export default function ReviewForm({ isOpen, onClose = () => {} }) {
  const modalRef = useRef(null)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    rating: 5,
    comment: '',
    order_id: '',
  })
  const [reviewFormError, setReviewFormError] = useState('')
  const [hoverRating, setHoverRating] = useState(0)

  // Auto-fill form khi mở modal nếu đã đăng nhập hoặc có customer info
  useEffect(() => {
    if (isOpen) {
      const user = getUser()
      const customerInfo = getCustomerInfo()
      
      setReviewForm({
        customer_name: user?.name || customerInfo?.customer_name || '',
        customer_phone: user?.phone || customerInfo?.customer_phone || '',
        customer_email: user?.email || customerInfo?.customer_email || '',
        rating: 5,
        comment: '',
        order_id: '',
      })
      setReviewFormError('')
      setHoverRating(0)
    }
  }, [isOpen])

  // Close modal when clicking outside and prevent body scroll
  useEffect(() => {
    if (!isOpen || !onClose) return

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (typeof onClose === 'function') {
          onClose()
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  // Handle review form submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setReviewFormError('')

    if (!reviewForm.customer_name.trim()) {
      setReviewFormError('Vui lòng nhập tên của bạn')
      return
    }

    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      setReviewFormError('Vui lòng chọn điểm đánh giá')
      return
    }

    setSubmittingReview(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: reviewForm.customer_name.trim(),
          customer_phone: reviewForm.customer_phone?.trim() || '',
          customer_email: reviewForm.customer_email?.trim() || '',
          rating: reviewForm.rating,
          comment: reviewForm.comment?.trim() || '',
          order_id: reviewForm.order_id?.trim() || '',
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Reset form
        setReviewForm({
          customer_name: '',
          customer_phone: '',
          customer_email: '',
          rating: 5,
          comment: '',
          order_id: '',
        })
        if (typeof onClose === 'function') {
          onClose()
        }
        
        // Show success message
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: {
                message: data.message || 'Cảm ơn bạn đã đánh giá! Đánh giá của bạn sẽ được duyệt trước khi hiển thị.',
                type: 'success',
              },
            })
          )
        }
      } else {
        setReviewFormError(data.error || 'Có lỗi xảy ra. Vui lòng thử lại sau.')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      setReviewFormError('Có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={() => typeof onClose === 'function' && onClose()}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors z-10 cursor-pointer"
          aria-label="Đóng"
          disabled={submittingReview}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-border bg-primary/10 py-4 px-6">
          <h2 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Để lại đánh giá
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleReviewSubmit} className="p-6 space-y-6">
          {reviewFormError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{reviewFormError}</p>
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Tên của bạn <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={reviewForm.customer_name}
              onChange={(e) => setReviewForm({ ...reviewForm, customer_name: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Nhập tên của bạn"
              maxLength={100}
              required
              disabled={submittingReview}
            />
          </div>

          {/* Rating - Shopee Style */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-4">
              Đánh giá của bạn <span className="text-red-400">*</span>
            </label>
            
            {/* Rating Stars - Modern Design */}
            <div className="flex flex-col items-center gap-4 p-6 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => !submittingReview && setReviewForm({ ...reviewForm, rating })}
                    disabled={submittingReview}
                    onMouseEnter={() => !submittingReview && setHoverRating(rating)}
                    onMouseLeave={() => !submittingReview && setHoverRating(0)}
                    className={`relative transition-all duration-200 ${
                      submittingReview ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110 active:scale-95'
                    }`}
                  >
                    <Star 
                      className={`w-10 h-10 transition-all duration-200 ${
                        (hoverRating >= rating && hoverRating > 0) || (hoverRating === 0 && reviewForm.rating >= rating)
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                          : 'text-muted-foreground/30 fill-muted-foreground/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              {/* Rating Text */}
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-black text-foreground">{reviewForm.rating}</span>
                  <span className="text-lg text-muted-foreground">/</span>
                  <span className="text-lg text-muted-foreground">5</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {reviewForm.rating === 1 && 'Rất không hài lòng'}
                  {reviewForm.rating === 2 && 'Không hài lòng'}
                  {reviewForm.rating === 3 && 'Bình thường'}
                  {reviewForm.rating === 4 && 'Hài lòng'}
                  {reviewForm.rating === 5 && 'Rất hài lòng'}
                </p>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Bình luận
            </label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              maxLength={500}
              disabled={submittingReview}
            />
            <p className="text-xs text-muted-foreground mt-1">{reviewForm.comment.length}/500 ký tự</p>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Số điện thoại (tùy chọn)
              </label>
              <input
                type="tel"
                value={reviewForm.customer_phone}
                onChange={(e) => setReviewForm({ ...reviewForm, customer_phone: e.target.value })}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="0123456789"
                maxLength={20}
                disabled={submittingReview}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Email (tùy chọn)
              </label>
              <input
                type="email"
                value={reviewForm.customer_email}
                onChange={(e) => setReviewForm({ ...reviewForm, customer_email: e.target.value })}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="email@example.com"
                maxLength={100}
                disabled={submittingReview}
              />
            </div>
          </div>

          {/* Order ID */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Mã đơn hàng (tùy chọn)
            </label>
            <input
              type="text"
              value={reviewForm.order_id}
              onChange={(e) => setReviewForm({ ...reviewForm, order_id: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="ORD-20240101-0001"
              maxLength={50}
              disabled={submittingReview}
            />
            <p className="text-xs text-muted-foreground mt-1">Nếu bạn đã đặt hàng, nhập mã đơn hàng để chúng tôi xác minh</p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-4 border-t-2 border-border">
            <button
              type="button"
              onClick={() => typeof onClose === 'function' && onClose()}
              className="flex-1 px-6 py-3 bg-muted text-muted-foreground rounded-lg font-semibold hover:bg-muted/80 transition-colors cursor-pointer"
              disabled={submittingReview}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={submittingReview}
            >
              {submittingReview ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  Gửi đánh giá
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
