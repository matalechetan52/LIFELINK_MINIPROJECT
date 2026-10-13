import React, { useState } from 'react';
import { bookingApi } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, DollarSign, CheckCircle, ShieldCheck } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, resource, bookingData, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  if (!isOpen || !resource || !bookingData) return null;

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/resources/${resource.resource_id}` } });
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await bookingApi.createBooking({
        resource_id: resource.resource_id,
        user_id: user.user_id,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
      });

      if (response.success && response.data) {
        success('Booking reserved successfully! You can now manage payment.', 'Booking Created');
        if (onSuccess) {
          onSuccess(response.data);
        }
        onClose();
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create booking.';
      setErrorMsg(message);
      toastError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return '';
    try {
      return new Date(dtStr).toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dtStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Reservation Summary
            </span>
            <h3 className="font-heading font-bold text-lg text-white">
              Confirm Resource Booking
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

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-sm text-slate-900 mb-1">{resource.name}</h4>
            <p className="text-xs text-slate-500">
              {resource.category_name} • {resource.location || 'Standard location'}
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Start Time:
              </span>
              <span className="font-semibold text-slate-800">
                {formatDateTime(bookingData.startTime)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> End Time:
              </span>
              <span className="font-semibold text-slate-800">
                {formatDateTime(bookingData.endTime)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Total Duration:</span>
              <span className="font-semibold text-slate-800">{bookingData.hours} hours</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Hourly Rate:</span>
              <span className="font-semibold text-slate-800">
                ${Number(resource.price_per_hour).toFixed(2)}/hr
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 text-sm font-bold">
              <span className="text-slate-900">Total Calculated Amount:</span>
              <span className="text-amber-600 font-heading text-lg">
                ${bookingData.estimatedCost}
              </span>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
              {errorMsg}
            </p>
          )}

          <div className="flex items-start gap-2 p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-[11px] text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              By confirming, this period is held under your account in <strong>PENDING</strong> status until payment is confirmed.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm & Reserve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
