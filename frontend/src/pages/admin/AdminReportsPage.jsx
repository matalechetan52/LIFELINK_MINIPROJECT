import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import StatCard from '../../components/common/StatCard';
import MetricChart from '../../components/reports/MetricChart';
import TrendAreaChart from '../../components/reports/TrendAreaChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { reportApi } from '../../api/reportApi';
import { useToast } from '../../context/ToastContext';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  CreditCard,
  Calendar,
  Clock,
  Shield,
  Briefcase,
} from 'lucide-react';

const AdminReportsPage = () => {
  const [resourceReport, setResourceReport] = useState(null);
  const [bookingReport, setBookingReport] = useState(null);
  const [queueReport, setQueueReport] = useState(null);
  const [paymentReport, setPaymentReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { error: toastError } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadAllReports = async () => {
      setIsLoading(true);
      try {
        const [rRes, bRes, qRes, pRes] = await Promise.all([
          reportApi.getResourceReport().catch(() => ({ data: null })),
          reportApi.getBookingReport().catch(() => ({ data: null })),
          reportApi.getQueueReport().catch(() => ({ data: null })),
          reportApi.getPaymentReport().catch(() => ({ data: null })),
        ]);

        if (!isMounted) return;

        if (rRes?.success) setResourceReport(rRes.data);
        if (bRes?.success) setBookingReport(bRes.data);
        if (qRes?.success) setQueueReport(qRes.data);
        if (pRes?.success) setPaymentReport(pRes.data);
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to generate platform reports.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAllReports();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <AppLayout withSidebar>
        <div className="py-24 flex justify-center">
          <LoadingSpinner text="Computing platform-wide analytics & financial telemetry..." size="lg" />
        </div>
      </AppLayout>
    );
  }

  const pSummary = paymentReport?.summary || {};
  const bSummary = bookingReport?.summary || {};
  const rSummary = resourceReport?.summary || {};
  const qSummary = queueReport?.summary || {};

  // Monthly paid revenue trend
  const paymentMonthlyTrend = (paymentReport?.monthly_paid_trend || []).map((m) => ({
    month: m.month,
    paid_amount: Number(m.paid_amount || 0),
    paid_transactions: Number(m.paid_transactions || 0),
  }));

  // Payment status distribution
  const paymentStatusData = (paymentReport?.status_breakdown || []).map((s) => ({
    name: s.status,
    value: s.payment_count,
  }));

  // Booking status distribution
  const bookingStatusData = (bookingReport?.status_breakdown || []).map((s) => ({
    name: s.status,
    value: s.booking_count,
  }));

  return (
    <AppLayout withSidebar>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold tracking-wide mb-2">
              <Shield className="w-3.5 h-3.5" />
              Administrative Financial & Telemetry Authority
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Platform Analytics & Financial Reports
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Authorized financial oversight, gross transaction volume, queue congestion, and fleet health.
            </p>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gross Settled Volume"
            value={`$${Number(pSummary.paid_amount || 0).toFixed(2)}`}
            subtitle={`${pSummary.paid_count || 0} cleared transactions`}
            icon={DollarSign}
            color="emerald"
          />
          <StatCard
            title="Pending Settlements"
            value={`$${Number(pSummary.pending_amount || 0).toFixed(2)}`}
            subtitle={`${pSummary.pending_count || 0} unpaid bookings`}
            icon={CreditCard}
            color="gold"
          />
          <StatCard
            title="Platform Bookings"
            value={bSummary.total_bookings || 0}
            subtitle={`${bSummary.completed || 0} completed successfully`}
            icon={Calendar}
            color="navy"
          />
          <StatCard
            title="Active Queue Waitlists"
            value={qSummary.waiting || 0}
            subtitle={`Average waiting position: ${qSummary.average_waiting_position || 1}`}
            icon={Clock}
            color="purple"
          />
        </div>

        {/* Financial Recharts Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Paid Trend */}
          <TrendAreaChart
            title="12-Month Settled Revenue Volume ($)"
            data={paymentMonthlyTrend}
            xKey="month"
            series={[
              { key: 'paid_amount', name: 'Settled Revenue ($)', color: '#10b981' },
            ]}
          />

          {/* Payment Status Breakdown */}
          <MetricChart
            title="Platform Payment Gateway Status Distribution"
            data={paymentStatusData}
            xKey="name"
            yKey="value"
            colors={['#10b981', '#f59e0b', '#f43f5e', '#64748b']}
          />
        </div>

        {/* Operational Recharts Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Status Distribution */}
          <MetricChart
            title="Platform Booking Lifecycle Breakdown"
            data={bookingStatusData}
            xKey="name"
            yKey="value"
            colors={['#f59e0b', '#3b82f6', '#10b981', '#f43f5e', '#64748b']}
          />

          {/* Platform Fleet Health Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-heading font-bold text-sm text-slate-900 mb-4">
                Fleet Capacity & Availability Distribution
              </h4>
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1 text-slate-700 font-semibold">
                    <span>Available for Booking</span>
                    <span>{rSummary.available || 0} units</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full"
                      style={{
                        width: `${
                          rSummary.total_resources
                            ? ((rSummary.available || 0) / rSummary.total_resources) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-700 font-semibold">
                    <span>In Maintenance Servicing</span>
                    <span>{rSummary.in_maintenance || 0} units</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-orange-500 h-2.5 rounded-full"
                      style={{
                        width: `${
                          rSummary.total_resources
                            ? ((rSummary.in_maintenance || 0) / rSummary.total_resources) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-700 font-semibold">
                    <span>Currently Unavailable / Booked</span>
                    <span>{rSummary.unavailable || 0} units</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-2.5 rounded-full"
                      style={{
                        width: `${
                          rSummary.total_resources
                            ? ((rSummary.unavailable || 0) / rSummary.total_resources) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Total Fleet Items: {rSummary.total_resources || 0}</span>
              <span>Avg Rate: ${Number(rSummary.average_hourly_price || 0).toFixed(2)}/hr</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminReportsPage;
