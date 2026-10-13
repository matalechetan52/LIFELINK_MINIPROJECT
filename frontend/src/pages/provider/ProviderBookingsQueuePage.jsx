import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { bookingApi } from '../../api/bookingApi';
import { queueApi } from '../../api/queueApi';
import { resourceApi } from '../../api/resourceApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, CheckCircle2, XCircle, User, ArrowRight } from 'lucide-react';

const ProviderBookingsQueuePage = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState('BOOKINGS');
  const [fleetResources, setFleetResources] = useState([]);
  const [fleetBookings, setFleetBookings] = useState([]);
  const [fleetQueues, setFleetQueues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Get resources to determine provider's resource IDs
      const rRes = await resourceApi.getResources();
      const myResources = (rRes.data || []).filter(
        (r) => Number(r.owner_id) === Number(user?.user_id)
      );
      setFleetResources(myResources);
      const myResourceIds = new Set(myResources.map((r) => r.resource_id));

      // 2. Load all bookings & filter by owned resources
      const bRes = await bookingApi.getAllBookings();
      if (bRes.success && Array.isArray(bRes.data)) {
        const ownedBookings = bRes.data.filter((b) =>
          myResourceIds.has(Number(b.resource_id))
        );
        setFleetBookings(ownedBookings);
      }

      // 3. Load all queues & filter by owned resources
      const qRes = await queueApi.getAllQueues();
      if (qRes.success && Array.isArray(qRes.data)) {
        const ownedQueues = qRes.data.filter((q) =>
          myResourceIds.has(Number(q.resource_id))
        );
        setFleetQueues(ownedQueues);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load bookings and queues.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await bookingApi.updateBooking(bookingId, { status: newStatus });
      if (res.success) {
        success(`Booking #${bookingId} marked as ${newStatus}.`);
        loadData();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update booking status.');
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Resource Provider Workspace
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Fleet Bookings & Queue Demand
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review customer reservations, confirm status transitions, and audit waiting queue entries.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('BOOKINGS')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'BOOKINGS'
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fleet Bookings ({fleetBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('QUEUE')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'QUEUE'
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Queue Demand ({fleetQueues.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Fetching fleet operational flow..." size="lg" />
          </div>
        ) : activeTab === 'BOOKINGS' ? (
          fleetBookings.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                      <th className="p-4 pl-6">ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Equipment</th>
                      <th className="p-4">Schedule</th>
                      <th className="p-4">Total Value</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fleetBookings.map((b) => (
                      <tr key={b.booking_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-slate-500">
                          #{b.booking_id}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">
                            {b.user_name || 'Customer'}
                          </span>
                          <span className="text-[10px] text-slate-400">User ID #{b.user_id}</span>
                        </td>
                        <td className="p-4 font-semibold text-slate-800">
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
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.booking_id, 'ACTIVE')}
                              className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px]"
                            >
                              Start Session
                            </button>
                          )}
                          {b.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.booking_id, 'COMPLETED')}
                              className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px]"
                            >
                              Complete
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
              title="No bookings recorded on your fleet"
              description="Customer bookings for your registered equipment will appear here."
            />
          )
        ) : (
          /* QUEUE DEMAND TAB */
          fleetQueues.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                      <th className="p-4 pl-6">Queue ID</th>
                      <th className="p-4">Customer ID</th>
                      <th className="p-4">Equipment</th>
                      <th className="p-4">Requested Window</th>
                      <th className="p-4">Position</th>
                      <th className="p-4 pr-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fleetQueues.map((q) => (
                      <tr key={q.queue_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-slate-500">
                          #{q.queue_id}
                        </td>
                        <td className="p-4 text-slate-700 font-medium">
                          Customer #{q.user_id}
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          {q.resource_name || `Unit #${q.resource_id}`}
                        </td>
                        <td className="p-4 text-slate-600 text-[11px]">
                          <div>From {formatDateTime(q.requested_start)}</div>
                          <div className="text-slate-400">To {formatDateTime(q.requested_end)}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900">
                            #{q.queue_position}
                          </span>
                        </td>
                        <td className="p-4 pr-6">
                          <StatusBadge status={q.status} size="xs" />
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
              title="No customer queue entries waiting"
              description="When your equipment is unavailable, customer waitlist entries will register here."
            />
          )
        )}
      </div>
    </AppLayout>
  );
};

export default ProviderBookingsQueuePage;
