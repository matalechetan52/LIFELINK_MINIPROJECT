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
  Briefcase,
  Calendar,
  Clock,
  Wrench,
  Star,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Layers,
} from 'lucide-react';

const ProviderDashboardPage = () => {
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
      setErrorMsg(err.response?.data?.message || 'Failed to load provider dashboard.');
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
          <LoadingSpinner text="Retrieving provider operations dashboard..." size="lg" />
        </div>
      </AppLayout>
    );
  }

  const summary = dashboardData?.summary || {};
  const recent = dashboardData?.recent || {};
  const resourcesSummary = summary.resources || {};
  const bookingsSummary = summary.bookings || {};
  const queueSummary = summary.queue || {};
  const maintenanceSummary = summary.maintenance || {};
  const reviewsSummary = summary.reviews || {};

  return (
    <AppLayout withSidebar>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Resource Provider Workspace
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Provider Operations Console
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Oversee fleet availability, monitor customer queue demand, and schedule maintenance.
            </p>
          </div>

          <Link
            to="/provider/resources/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-auto hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            Register New Equipment
          </Link>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl">
            {errorMsg}
          </div>
        )}

        {/* Primary StatCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Fleet Inventory"
            value={resourcesSummary.total_resources}
            subtitle={`${resourcesSummary.available_resources || 0} active & available`}
            icon={Briefcase}
            color="navy"
          />
          <StatCard
            title="Bookings"
            value={bookingsSummary.total_bookings}
            subtitle={`${bookingsSummary.confirmed_bookings || 0} confirmed • ${bookingsSummary.pending_bookings || 0} pending`}
            icon={Calendar}
            color="gold"
          />
          <StatCard
            title="Queue Demand"
            value={queueSummary.waiting_entries}
            subtitle={`${queueSummary.total_queue_entries || 0} lifetime waitlist`}
            icon={Clock}
            color="purple"
          />
          <StatCard
            title="Maintenance"
            value={maintenanceSummary.total_records}
            subtitle={`${maintenanceSummary.ongoing || 0} in progress service`}
            icon={Wrench}
            color="rose"
          />
          <StatCard
            title="Average Rating"
            value={reviewsSummary.average_rating ? `${reviewsSummary.average_rating} ★` : 'N/A'}
            subtitle={`${reviewsSummary.total_reviews || 0} customer reviews`}
            icon={Star}
            color="emerald"
          />
        </div>

        {/* Recent Fleet Bookings & Active Queue Demand */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Recent Fleet Bookings
                  </h3>
                </div>
                <Link
                  to="/provider/bookings"
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
                  description="When customers book your fleet items, reservations will show up here."
                />
              )}
            </div>
          </div>

          {/* Active Queue Demand */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Queue Demand on Your Fleet
                  </h3>
                </div>
                <Link
                  to="/provider/bookings"
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  Manage queue <ArrowRight className="w-3.5 h-3.5" />
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
                          Period: {formatDateTime(q.requested_start)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
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
                  title="No queue pressure detected"
                  description="Customer waitlists for your equipment will be registered here."
                />
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/provider/resources"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Fleet Management
              </span>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                Inventory & Status
              </h4>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </Link>

          <Link
            to="/provider/maintenance"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Fleet Servicing
              </span>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                Maintenance Schedule
              </h4>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </Link>

          <Link
            to="/provider/reports"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Analytics
              </span>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                Performance Reports
              </h4>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProviderDashboardPage;
