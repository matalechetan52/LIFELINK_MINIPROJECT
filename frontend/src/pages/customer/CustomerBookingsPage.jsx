import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '../../components/common/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import PaymentModal from '../../components/payments/PaymentModal';
import ReviewModal from '../../components/reviews/ReviewModal';
import { bookingApi } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  CreditCard,
  XCircle,
  Star,
  Search,
  Filter,
  ArrowRight,
} from 'lucide-react';

const CustomerBookingsPage = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedBookingForPay, setSelectedBookingForPay] = useState(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const res = await bookingApi.getAllBookings();
      if (res.success && Array.isArray(res.data)) {
        // Filter bookings belonging to the logged-in customer
        const myBookings = res.data.filter(
          (b) => Number(b.user_id) === Number(user?.user_id)
        );
        setBookings(myBookings);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to fetch bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const handleCancelBooking = async () => {
    if (!selectedBookingForCancel) return;
    setIsCancelling(true);
    try {
      const res = await bookingApi.cancelBooking(selectedBookingForCancel.booking_id);
      if (res.success) {
        success('Booking has been cancelled.', 'Booking Cancelled');
        setSelectedBookingForCancel(null);
        loadBookings();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Tab filter
      if (activeTab !== 'ALL' && b.status !== activeTab) {
        return false;
      }
      // 2. Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = b.resource_name?.toLowerCase().includes(query);
        const matchesId = String(b.booking_id).includes(query);
        if (!matchesName && !matchesId) return false;
      }
      return true;
    });
  }, [bookings, activeTab, searchTerm]);

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'N/A';
    try {
      return new Date(dtStr).toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dtStr;
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All Bookings' },
    { id: 'PENDING', label: 'Pending Payment' },
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'ACTIVE', label: 'In Progress' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <AppLayout withSidebar>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Customer Workspace
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              My Equipment Bookings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track reservation schedules, settle pending payments, or cancel upcoming bookings.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-semibold tracking-wide transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-amber-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by equipment name or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Loading your reservations..." size="lg" />
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div
                key={b.booking_id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{b.booking_id}
                    </span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>

                  <h3 className="font-heading font-bold text-lg text-slate-900">
                    {b.resource_name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateTime(b.start_time)}
                    </span>
                    <span className="text-slate-300">→</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateTime(b.end_time)}
                    </span>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Total Due
                    </span>
                    <span className="text-xl font-extrabold text-slate-900 font-heading">
                      ${Number(b.total_amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status === 'PENDING' && (
                      <button
                        onClick={() => setSelectedBookingForPay(b)}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay Now
                      </button>
                    )}

                    {b.status === 'COMPLETED' && (
                      <button
                        onClick={() => setSelectedBookingForReview(b)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        Rate Equipment
                      </button>
                    )}

                    {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                      <button
                        onClick={() => setSelectedBookingForCancel(b)}
                        className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No bookings match your filter"
            description="You don't have any reservations matching this status."
          />
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={!!selectedBookingForCancel}
        onClose={() => setSelectedBookingForCancel(null)}
        onConfirm={handleCancelBooking}
        title="Cancel This Booking?"
        message={`Are you sure you want to cancel booking #${selectedBookingForCancel?.booking_id} for ${selectedBookingForCancel?.resource_name}?`}
        confirmText="Confirm Cancellation"
        isDanger={true}
        isLoading={isCancelling}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={!!selectedBookingForPay}
        onClose={() => setSelectedBookingForPay(null)}
        booking={selectedBookingForPay}
        onSuccess={() => {
          loadBookings();
        }}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={!!selectedBookingForReview}
        onClose={() => setSelectedBookingForReview(null)}
        booking={selectedBookingForReview}
        onSuccess={() => {
          loadBookings();
        }}
      />
    </AppLayout>
  );
};

export default CustomerBookingsPage;
