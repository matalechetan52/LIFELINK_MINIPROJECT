import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import StatCard from '../../components/common/StatCard';
import MetricChart from '../../components/reports/MetricChart';
import TrendAreaChart from '../../components/reports/TrendAreaChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { reportApi } from '../../api/reportApi';
import { useToast } from '../../context/ToastContext';
import { BarChart3, TrendingUp, DollarSign, Calendar, Clock, Briefcase } from 'lucide-react';

const ProviderReportsPage = () => {
  const [resourceReport, setResourceReport] = useState(null);
  const [bookingReport, setBookingReport] = useState(null);
  const [queueReport, setQueueReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { error: toastError } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      setIsLoading(true);
      try {
        const [rRes, bRes, qRes] = await Promise.all([
          reportApi.getResourceReport().catch(() => ({ data: null })),
          reportApi.getBookingReport().catch(() => ({ data: null })),
          reportApi.getQueueReport().catch(() => ({ data: null })),
        ]);

        if (!isMounted) return;

        if (rRes?.success) setResourceReport(rRes.data);
        if (bRes?.success) setBookingReport(bRes.data);
        if (qRes?.success) setQueueReport(qRes.data);
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to generate fleet analytics reports.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <AppLayout withSidebar>
        <div className="py-24 flex justify-center">
          <LoadingSpinner text="Computing fleet analytics & reports..." size="lg" />
        </div>
      </AppLayout>
    );
  }

  const bSummary = bookingReport?.summary || {};
  const rSummary = resourceReport?.summary || {};
  const qSummary = queueReport?.summary || {};

  // Format booking status chart data
  const bookingStatusData = (bookingReport?.status_breakdown || []).map((s) => ({
    name: s.status,
    value: s.booking_count,
  }));

  // Format monthly trend data
  const monthlyTrendData = bookingReport?.monthly_trend || [];

  // Format queue demand by resource
  const queueResourceData = (queueReport?.resources || []).slice(0, 6).map((r) => ({
    name: r.resource_name?.length > 15 ? `${r.resource_name.slice(0, 15)}...` : r.resource_name,
    value: r.waiting,
  }));

  return (
    <AppLayout withSidebar>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            Resource Provider Workspace
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Fleet Performance & Revenue Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics on fleet utilization, booking status distributions, and customer queue pressure.
          </p>
        </div>

        {/* KPI Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Non-Cancelled Value"
            value={`$${Number(bSummary.non_cancelled_booking_value || 0).toFixed(2)}`}
            subtitle="Confirmed rental demand"
            icon={DollarSign}
            color="gold"
          />
          <StatCard
            title="Completed Bookings"
            value={bSummary.completed || 0}
            subtitle={`Out of ${bSummary.total_bookings || 0} total bookings`}
            icon={Calendar}
            color="emerald"
          />
          <StatCard
            title="Active Waiting Queue"
            value={qSummary.waiting || 0}
            subtitle={`Avg position: ${qSummary.average_waiting_position || 1}`}
            icon={Clock}
            color="purple"
          />
          <StatCard
            title="Average Hourly Rate"
            value={`$${Number(rSummary.average_hourly_price || 0).toFixed(2)}`}
            subtitle={`${rSummary.total_resources || 0} fleet items`}
            icon={TrendingUp}
            color="navy"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Trend Area Chart */}
          <TrendAreaChart
            title="12-Month Fleet Booking Volume & Completion"
            data={monthlyTrendData}
            xKey="month"
            series={[
              { key: 'total_bookings', name: 'Total Bookings', color: '#f59e0b' },
              { key: 'completed_bookings', name: 'Completed Rentals', color: '#10b981' },
            ]}
          />

          {/* Booking Status Distribution */}
          <MetricChart
            title="Booking Count by Current Lifecycle Status"
            data={bookingStatusData}
            xKey="name"
            yKey="value"
            colors={['#f59e0b', '#3b82f6', '#10b981', '#f43f5e']}
          />
        </div>

        {/* Queue Demand by Resource */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MetricChart
            title="Customer Queue Waitlists by Equipment Unit"
            data={queueResourceData}
            xKey="name"
            yKey="value"
            colors={['#8b5cf6', '#6366f1', '#a855f7', '#ec4899']}
          />

          {/* Resource Inventory Utilization Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h4 className="font-heading font-bold text-sm text-slate-900 mb-4">
              Equipment Fleet Utilization Overview
            </h4>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase">
                    <th className="pb-2">Resource</th>
                    <th className="pb-2 text-center">Bookings</th>
                    <th className="pb-2 text-center">Queue</th>
                    <th className="pb-2 text-center">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(resourceReport?.resources || []).map((r) => (
                    <tr key={r.resource_id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-800 truncate max-w-[160px]">
                        {r.name}
                      </td>
                      <td className="py-2.5 text-center text-slate-600">{r.total_bookings}</td>
                      <td className="py-2.5 text-center font-bold text-purple-600">
                        {r.waiting_entries}
                      </td>
                      <td className="py-2.5 text-center text-amber-500 font-bold">
                        {r.average_rating ? `${r.average_rating} ★` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProviderReportsPage;
