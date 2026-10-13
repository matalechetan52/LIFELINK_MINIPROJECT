import React, { useState } from 'react';
import { reviewApi } from '../../api/reviewApi';
import { useToast } from '../../context/ToastContext';
import { X, Star, MessageSquare } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, booking, onSuccess, existingReview = null }) => {
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview ? existingReview.comment || '' : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { success, error: toastError } = useToast();

  if (!isOpen || (!booking && !existingReview)) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (existingReview) {
        // Edit existing review
        const response = await reviewApi.updateReview(existingReview.review_id, {
          rating,
          comment: comment.trim(),
        });
        if (response.success) {
          success('Your review has been updated.', 'Review Updated');
          if (onSuccess) onSuccess(response.data);
          onClose();
        }
      } else {
        // Create new review
        const response = await reviewApi.createReview({
          resource_id: booking.resource_id,
          booking_id: booking.booking_id,
          rating,
          comment: comment.trim(),
        });
        if (response.success) {
          success('Thank you for rating your equipment experience!', 'Review Submitted');
          if (onSuccess) onSuccess(response.data);
          onClose();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Feedback & Rating
            </span>
            <h3 className="font-heading font-bold text-lg text-white">
              {existingReview ? 'Update Your Review' : 'Rate Equipment Experience'}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center py-2">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              How would you rate this resource?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs text-amber-600 font-bold mt-1 block">
              {rating} of 5 Stars
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Your Review / Feedback
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share how the equipment functioned, reliability, condition..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50 resize-none"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : existingReview ? 'Save Changes' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
