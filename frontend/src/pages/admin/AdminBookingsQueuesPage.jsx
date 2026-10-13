import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { bookingApi } from '../../api/bookingApi';
import { queueApi } from '../../api/queueApi';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const AdminBookingsQueuesPage = () => {
  const [activeTab, setActiveTab] = useState('QUEUES');
  const [allBookings, setAllBookings] = useState([]);
  const [allQueues, setAllQueues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [convertingQueueId, setConvertingQueueId] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const { success, error: toastError } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bRes, qRes] = await Promise.all([
        bookingApi.getAllBookings(),
        queueApi.getAllQueues(),
      ]);

      if (bRes.success && Array.isArray(bRes.data)) {
        setAllBookings(bRes.data);
      }
      if (qRes.success && Array.isArray(qRes.data)) {
        setAllQueues(qRes.data);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load bookings and queues.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Admin Queue Conversion
  const handleConvertQueue = async (queueId) => {
    setConvertingQueueId(queueId);
    try {
      const res = await queueApi.convertQueueToBooking(queueId);
      if (res.success) {
        success(
          `Queue entry #${queueId} converted to booking #${res.data?.booking_id || ''}!`,
          'Queue Converted'
        );
        loadData();
      }
    } catch (err) {
      toastError(
        err.response?.data?.message ||
          'Failed to convert queue entry. Verify the equipment is now available for the requested period.'
      );
    } finally {
      setConvertingQueueId(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBookingId) return;
    try {
      const res = await bookingApi.cancelBooking(cancellingBookingId);
      if (res.success) {
        success(`Booking #${cancellingBookingId} cancelled by administrator.`);
        setCancellingBookingId(null);
        loadData();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

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

  return (
    <AppLayout withSidebar>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
              Admin Console
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Platform Bookings & Queue Conversion Engine
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Convert eligible reservation queue entries into bookings and monitor global fulfillment.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('QUEUES')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'QUEUES'
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Queue Conversion ({allQueues.filter((q) => q.status === 'WAITING').length} Waiting)
            </button>
            <button
              onClick={() => setActiveTab('BOOKINGS')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'BOOKINGS'
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Platform Bookings ({allBookings.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Retrieving platform queue and booking ledgers..." size="lg" />
          </div>
        ) : activeTab === 'QUEUES' ? (
          allQueues.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                      <th className="p-4 pl-6">Queue ID</th>
                      <th className="p-4">Customer ID</th>
                      <th className="p-4">Resource Unit</th>
                      <th className="p-4">Requested Window</th>
                      <th className="p-4">Priority / Position</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Admin Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allQueues.map((q) => (
                      <tr key={q.queue_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-slate-500">
                          #{q.queue_id}
                        </td>
                        <td className="p-4 font-semibold text-slate-800">
                          User #{q.user_id}
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          {q.resource_name || `Unit #${q.resource_id}`}
                        </td>
                        <td className="p-4 text-slate-600 text-[11px]">
                          <div>{formatDateTime(q.requested_start)}</div>
                          <div className="text-slate-400">to {formatDateTime(q.requested_end)}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 mr-2">
                            Pos #{q.queue_position}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            Score: {q.priority_score || 0}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={q.status} size="xs" />
                        </td>
                        <td className="p-4 pr-6 text-right">
                          {q.status === 'WAITING' ? (
                            <button
                              onClick={() => handleConvertQueue(q.queue_id)}
                              disabled={convertingQueueId === q.queue_id}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              {convertingQueueId === q.queue_id ? 'Converting...' : 'Convert to Booking'}
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">
                              Processed ({q.status})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No platform queue entries"
              description="Customer waitlist requests will be registered here."
            />
          )
        ) : (
          /* ALL BOOKINGS TAB */
          allBookings.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                      <th className="p-4 pl-6">ID</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Equipment Unit</th>
                      <th className="p-4">Period</th>
                      <th className="p-4">Value</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allBookings.map((b) => (
                      <tr key={b.booking_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-slate-500">
                          #{b.booking_id}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">{b.user_name}</span>
                          <span className="text-[10px] text-slate-400">User #{b.user_id}</span>
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          {b.resource_name}
                        </td>
                        <td className="p-4 text-slate-600 text-[11px]">
                          <div>{formatDateTime(b.start_time)}</div>
                          <div className="text-slate-400">to {formatDateTime(b.end_time)}</div>
                        </td>
                        <td className="p-4 font-bold text-slate-900 font-heading">
                          ${Number(b.total_amount).toFixed(2)}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={b.status} size="xs" />
                        </td>
                        <td className="p-4 pr-6 text-right">
                          {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                            <button
                              onClick={() => setCancellingBookingId(b.booking_id)}
                              className="px-3 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No platform bookings"
              description="Platform reservations will be recorded here."
            />
          )
        )}
      </div>

      <ConfirmModal
        isOpen={!!cancellingBookingId}
        onClose={() => setCancellingBookingId(null)}
        onConfirm={handleCancelBooking}
        title="Admin Booking Cancellation"
        message={`Are you sure you want to cancel booking #${cancellingBookingId}?`}
        confirmText="Confirm Cancellation"
        isDanger={true}
      />
    </AppLayout>
  );
};

export default AdminBookingsQueuesPage;
