import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/common/AppLayout';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { dashboardApi } from '../../api/dashboardApi';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Users,
  Briefcase,
  Calendar,
  Clock,
  CreditCard,
  Wrench,
  Star,
  Layers,
  ArrowRight,
  Bell,
  BarChart3,
} from 'lucide-react';

const AdminDashboardPage = () => {
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
      setErrorMsg(err.response?.data?.message || 'Failed to load administrative dashboard.');
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
          <LoadingSpinner text="Retrieving platform operational metrics..." size="lg" />
        </div>
      </AppLayout>
    );
  }

  const summary = dashboardData?.summary || {};
  const recent = dashboardData?.recent || {};
  const usersSummary = summary.users || {};
  const resourcesSummary = summary.resources || {};
  const bookingsSummary = summary.bookings || {};
  const queueSummary = summary.queue || {};
  const paymentsSummary = summary.payments || {};
  const maintenanceSummary = summary.maintenance || {};

  return (
    <AppLayout withSidebar>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold tracking-wide mb-2">
              <Shield className="w-3.5 h-3.5" />
              Administrative Platform Control
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              System Operations Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Platform-wide telemetry, user distribution, equipment queues, and financial settlements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs shadow-md transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              Platform Analytics
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl">
            {errorMsg}
          </div>
        )}

        {/* Primary Platform KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Platform Users"
            value={usersSummary.total_users}
            subtitle={`${usersSummary.customers || 0} customers • ${usersSummary.resource_providers || 0} providers`}
            icon={Users}
            color="navy"
          />
          <StatCard
            title="Active Resources"
            value={resourcesSummary.total_resources}
            subtitle={`${resourcesSummary.available_resources || 0} available • ${resourcesSummary.maintenance_resources || 0} in service`}
            icon={Briefcase}
            color="emerald"
          />
          <StatCard
            title="All Bookings"
            value={bookingsSummary.total_bookings}
            subtitle={`${bookingsSummary.completed_bookings || 0} completed • ${bookingsSummary.active_bookings || 0} active`}
            icon={Calendar}
            color="gold"
          />
          <StatCard
            title="Total Revenue Volume"
            value={`$${Number(paymentsSummary.paid_amount || 0).toFixed(2)}`}
            subtitle={`${paymentsSummary.paid_payments || 0} settled transactions`}
            icon={CreditCard}
            color="purple"
          />
        </div>

        {/* Secondary Operational Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Queue Demand
              </span>
              <span className="text-xl font-extrabold text-slate-900 font-heading">
                {queueSummary.waiting_entries || 0} Waitlists
              </span>
              <span className="text-[11px] text-slate-500 block">
                {queueSummary.reserved_entries || 0} converted to reserve
              </span>
            </div>
            <Clock className="w-8 h-8 text-purple-500 opacity-80" />
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Maintenance Registry
              </span>
              <span className="text-xl font-extrabold text-slate-900 font-heading">
                {maintenanceSummary.total_records || 0} Total Records
              </span>
              <span className="text-[11px] text-slate-500 block">
                {maintenanceSummary.ongoing || 0} currently ongoing
              </span>
            </div>
            <Wrench className="w-8 h-8 text-orange-500 opacity-80" />
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Settlement Status
              </span>
              <span className="text-xl font-extrabold text-slate-900 font-heading">
                {paymentsSummary.pending_payments || 0} Pending
              </span>
              <span className="text-[11px] text-slate-500 block">
                {paymentsSummary.failed_payments || 0} failed / refunded
              </span>
            </div>
            <CreditCard className="w-8 h-8 text-emerald-500 opacity-80" />
          </div>
        </div>

        {/* Recent Operations Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Platform Bookings */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Recent Platform Bookings
                </h3>
              </div>
              <Link
                to="/admin/bookings"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                Control bookings <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recent.bookings && recent.bookings.length > 0 ? (
              <div className="space-y-3">
                {recent.bookings.map((b) => (
                  <div
                    key={b.booking_id}
                    className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-slate-400 text-[10px] font-bold block">
                        #{b.booking_id}
                      </span>
                      <p className="font-bold text-slate-900">{b.resource_name}</p>
                      <p className="text-[10px] text-slate-400">{formatDateTime(b.created_at)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-slate-900 font-heading">
                        ${Number(b.total_amount).toFixed(2)}
                      </span>
                      <StatusBadge status={b.status} size="xs" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No platform bookings yet.</p>
            )}
          </div>

          {/* Recent Platform Queue Demand */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Live Queue Requests
                </h3>
              </div>
              <Link
                to="/admin/bookings"
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                Manage queues <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recent.queue && recent.queue.length > 0 ? (
              <div className="space-y-3">
                {recent.queue.map((q) => (
                  <div
                    key={q.queue_id}
                    className="p-3 bg-purple-50/40 rounded-2xl border border-purple-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-slate-400 text-[10px] font-bold block">
                        Queue #{q.queue_id}
                      </span>
                      <p className="font-bold text-slate-900">{q.resource_name}</p>
                      <p className="text-[10px] text-slate-400">
                        Requested: {formatDateTime(q.requested_start)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900">
                        Position #{q.queue_position}
                      </span>
                      <StatusBadge status={q.status} size="xs" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No active queue entries.</p>
            )}
          </div>
        </div>

        {/* Admin Navigation Hub */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Link
            to="/admin/resources"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-400 hover:shadow-md transition-all text-xs space-y-1 block"
          >
            <Briefcase className="w-5 h-5 text-slate-800 mb-2" />
            <h4 className="font-bold text-sm text-slate-900">Resource Control</h4>
            <p className="text-slate-500 text-[11px]">Audit and manage all platform equipment units.</p>
          </Link>

          <Link
            to="/admin/categories"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-400 hover:shadow-md transition-all text-xs space-y-1 block"
          >
            <Layers className="w-5 h-5 text-amber-600 mb-2" />
            <h4 className="font-bold text-sm text-slate-900">Categories Registry</h4>
            <p className="text-slate-500 text-[11px]">Add and modify equipment classification taxonomy.</p>
          </Link>

          <Link
            to="/admin/notifications"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-400 hover:shadow-md transition-all text-xs space-y-1 block"
          >
            <Bell className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-bold text-sm text-slate-900">Broadcast Alerts</h4>
            <p className="text-slate-500 text-[11px]">Dispatch notifications directly to customer IDs.</p>
          </Link>

          <Link
            to="/admin/reports"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-400 hover:shadow-md transition-all text-xs space-y-1 block"
          >
            <BarChart3 className="w-5 h-5 text-purple-600 mb-2" />
            <h4 className="font-bold text-sm text-slate-900">Financial Reports</h4>
            <p className="text-slate-500 text-[11px]">ADMIN-only payment analytics and monthly volumes.</p>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboardPage;
