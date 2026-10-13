import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/common/AppLayout';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { dashboardApi } from '../../api/dashboardApi';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  CreditCard,
  Bell,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardApi.getDashboard();
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load customer dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'N/A';
    try {
      return new Date(dtStr).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dtStr;
    }
  };

  if (isLoading) {
    return (
      <AppLayout withSidebar>
        <div className="py-24 flex justify-center">
          <LoadingSpinner text="Retrieving customer workspace data..." size="lg" />
        </div>
      </AppLayout>
    );
  }

  const summary = dashboardData?.summary || {};
  const recent = dashboardData?.recent || {};
  const bookingsSummary = summary.bookings || {};
  const queueSummary = summary.queue || {};
  const paymentsSummary = summary.payments || {};
  const notificationsSummary = summary.notifications || {};

  return (
    <AppLayout withSidebar>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Customer Workspace
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Welcome back, {user?.name || 'Customer'}!
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage equipment reservations, track dynamic waitlists, and review settled payments.
            </p>
          </div>

          <Link
            to="/resources"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-auto hover:scale-[1.02]"
          >
            <Search className="w-4 h-4" />
            Find Equipment to Book
          </Link>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl">
            {errorMsg}
          </div>
        )}

        {/* Primary KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Bookings"
            value={bookingsSummary.total_bookings}
            subtitle={`${bookingsSummary.active_bookings || 0} active • ${bookingsSummary.pending_bookings || 0} pending`}
            icon={Calendar}
            color="navy"
          />
          <StatCard
            title="Queue Waitlists"
            value={queueSummary.waiting_entries}
            subtitle={`${queueSummary.total_queue_entries || 0} lifetime requests`}
            icon={Clock}
            color="purple"
          />
          <StatCard
            title="Settled Payments"
            value={`$${Number(paymentsSummary.paid_amount || 0).toFixed(2)}`}
            subtitle={`${paymentsSummary.paid_payments || 0} successful transactions`}
            icon={CreditCard}
            color="gold"
          />
          <StatCard
            title="Notifications"
            value={notificationsSummary.unread_notifications}
            subtitle={`${notificationsSummary.total_notifications || 0} total updates`}
            icon={Bell}
            color="emerald"
          />
        </div>

        {/* Booking & Queue Two-Column Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Recent Bookings
                  </h3>
                </div>
                <Link
                  to="/customer/bookings"
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recent.bookings && recent.bookings.length > 0 ? (
                <div className="space-y-3">
                  {recent.bookings.map((b) => (
                    <div
                      key={b.booking_id}
                      className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{b.resource_name}</p>
                        <p className="text-[11px] text-slate-500">
                          {formatDateTime(b.start_time)} — {formatDateTime(b.end_time)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusBadge status={b.status} size="xs" />
                        <span className="font-bold text-slate-900 font-heading">
                          ${Number(b.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No bookings recorded yet"
                  description="When you reserve an equipment item, it will appear here."
                />
              )}
            </div>
          </div>

          {/* Dynamic Reservation Queue Activity */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Active Dynamic Queue Entries
                  </h3>
                </div>
                <Link
                  to="/customer/queue"
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  Queue ledger <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recent.queue && recent.queue.length > 0 ? (
                <div className="space-y-3">
                  {recent.queue.map((q) => (
                    <div
                      key={q.queue_id}
                      className="p-3.5 bg-purple-50/40 rounded-2xl border border-purple-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{q.resource_name}</p>
                        <p className="text-[11px] text-slate-500">
                          Wanted: {formatDateTime(q.requested_start)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          Pos #{q.queue_position}
                        </span>
                        <StatusBadge status={q.status} size="xs" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Clock}
                  title="No active queue requests"
                  description="When a resource is unavailable, joining its queue will list your position here."
                />
              )}
            </div>
          </div>
        </div>

        {/* Recent Notifications & Payments Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notifications preview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-500" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Recent Alerts & Notices
                </h3>
              </div>
              <Link
                to="/customer/notifications"
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                All alerts <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recent.notifications && recent.notifications.length > 0 ? (
              <div className="space-y-2.5">
                {recent.notifications.map((n) => (
                  <div
                    key={n.notification_id}
                    className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                      n.is_read
                        ? 'bg-slate-50/50 border-slate-100 text-slate-600'
                        : 'bg-amber-50/50 border-amber-200 text-slate-900 font-medium'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">
                        {n.type}
                      </span>
                      <p className="mt-0.5">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatDateTime(n.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No recent alerts.</p>
            )}
          </div>

          {/* Payments preview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Recent Transactions
                </h3>
              </div>
              <Link
                to="/customer/payments"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                Payment ledger <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recent.payments && recent.payments.length > 0 ? (
              <div className="space-y-2.5">
                {recent.payments.map((p) => (
                  <div
                    key={p.payment_id}
                    className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{p.resource_name || 'Equipment'}</p>
                      <p className="text-[10px] text-slate-400">
                        {p.payment_method} • {formatDateTime(p.paid_at)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-slate-900 font-heading">
                        ${Number(p.amount).toFixed(2)}
                      </span>
                      <StatusBadge status={p.status} size="xs" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No payment history recorded.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CustomerDashboardPage;
