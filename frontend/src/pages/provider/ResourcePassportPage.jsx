import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../../components/common/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { resourcePassportApi } from '../../api/resourcePassportApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  ArrowLeft,
  Calendar,
  Wrench,
  Star,
  ShieldCheck,
  Clock,
  Tag,
  CheckCircle,
} from 'lucide-react';

const ResourcePassportPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const [passport, setPassport] = useState(null);
  const [history, setHistory] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  useEffect(() => {
    let isMounted = true;

    const loadPassportData = async () => {
      setIsLoading(true);
      try {
        const [passRes, histRes, bookRes, maintRes, revRes] = await Promise.all([
          resourcePassportApi.getResourcePassport(id),
          resourcePassportApi.getResourceHistory(id).catch(() => ({ data: [] })),
          resourcePassportApi.getPassportBookings(id).catch(() => ({ data: [] })),
          resourcePassportApi.getPassportMaintenance(id).catch(() => ({ data: [] })),
          resourcePassportApi.getPassportReviews(id).catch(() => ({ data: [] })),
        ]);

        if (!isMounted) return;

        if (passRes.success && passRes.data) {
          setPassport(passRes.data);
        }
        if (histRes.success && Array.isArray(histRes.data)) {
          setHistory(histRes.data);
        }
        if (bookRes.success && Array.isArray(bookRes.data)) {
          setBookings(bookRes.data);
        }
        if (maintRes.success && Array.isArray(maintRes.data)) {
          setMaintenance(maintRes.data);
        }
        if (revRes.success && Array.isArray(revRes.data)) {
          setReviews(revRes.data);
        }
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to load Resource Passport.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPassportData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'N/A';
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

  if (isLoading) {
    return (
      <AppLayout withSidebar>
        <div className="py-24 flex justify-center">
          <LoadingSpinner text="Generating verified Resource Passport..." size="lg" />
        </div>
      </AppLayout>
    );
  }

  const resource = passport?.resource || {};

  return (
    <AppLayout withSidebar>
      <div className="space-y-6">
        <Link
          to={user?.role === 'ADMIN' ? '/admin/resources' : '/provider/resources'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to equipment directory
        </Link>

        {/* Passport Banner Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 -mr-10 -mt-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Immutable Equipment Passport
              </div>

              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                {resource.name || `Equipment #${id}`}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span>Passport Unit #{resource.resource_id}</span>
                <span>•</span>
                <span>{resource.category_name}</span>
                <span>•</span>
                <span>{resource.location || 'Local Depository'}</span>
                <span>•</span>
                <StatusBadge status={resource.status} size="xs" />
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-700/80 text-right self-start md:self-auto shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Hourly Base Rate
              </span>
              <span className="text-2xl font-extrabold text-amber-400 font-heading">
                ${Number(resource.price_per_hour || 0).toFixed(2)}
                <span className="text-xs font-normal text-slate-300">/hr</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200/80 text-xs">
          {[
            { id: 'OVERVIEW', label: 'Consolidated Passport' },
            { id: 'HISTORY', label: `Lifecycle Log (${history.length})` },
            { id: 'BOOKINGS', label: `Booking Records (${bookings.length})` },
            { id: 'MAINTENANCE', label: `Servicing & Repairs (${maintenance.length})` },
            { id: 'REVIEWS', label: `Customer Feedback (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">
                Total Lifetime Bookings
              </span>
              <span className="text-2xl font-extrabold text-slate-900 font-heading">
                {bookings.length}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">
                Completed Rentals
              </span>
              <span className="text-2xl font-extrabold text-emerald-600 font-heading">
                {bookings.filter((b) => b.status === 'COMPLETED').length}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">
                Maintenance Interventions
              </span>
              <span className="text-2xl font-extrabold text-orange-600 font-heading">
                {maintenance.length}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">
                Customer Satisfaction
              </span>
              <span className="text-2xl font-extrabold text-amber-500 font-heading flex items-center gap-1">
                {reviews.length > 0
                  ? (reviews.reduce((a, b) => a + Number(b.rating || 0), 0) / reviews.length).toFixed(1)
                  : 'N/A'}{' '}
                ★
              </span>
            </div>

            <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Operating Specifications & Integrity Statement
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {resource.description || 'Verified equipment certified under LifeLink equipment network standards.'}
              </p>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Unit Registered: {formatDateTime(resource.created_at)}</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Authenticated Resource Record
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-heading font-bold text-base text-slate-900 mb-4">
              Immutable Lifecycle Events
            </h3>
            {history.length > 0 ? (
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 ml-2">
                {history.map((h) => (
                  <div key={h.history_id} className="relative text-xs">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-sm" />
                    <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                      {h.event_type}
                    </span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{h.event_description}</p>
                    <span className="text-[11px] text-slate-400">{formatDateTime(h.event_date)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No lifecycle events recorded yet.</p>
            )}
          </div>
        )}

        {activeTab === 'BOOKINGS' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="p-4 pl-6">Booking ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Schedule</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4 pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.booking_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-slate-800">#{b.booking_id}</td>
                      <td className="p-4 font-semibold text-slate-800">{b.user_name || `User #${b.user_id}`}</td>
                      <td className="p-4 text-slate-600 text-[11px]">
                        <div>{formatDateTime(b.start_time)}</div>
                        <div className="text-slate-400">to {formatDateTime(b.end_time)}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-900 font-heading">
                        ${Number(b.total_amount).toFixed(2)}
                      </td>
                      <td className="p-4 pr-6">
                        <StatusBadge status={b.status} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'MAINTENANCE' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="p-4 pl-6">Service ID</th>
                    <th className="p-4">Window</th>
                    <th className="p-4">Reason / Scope</th>
                    <th className="p-4 pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {maintenance.map((m) => (
                    <tr key={m.maintenance_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-slate-800">#{m.maintenance_id}</td>
                      <td className="p-4 text-slate-600 text-[11px]">
                        <div>{formatDateTime(m.start_date)}</div>
                        <div className="text-slate-400">to {formatDateTime(m.end_date)}</div>
                      </td>
                      <td className="p-4 text-slate-700 max-w-sm">{m.reason || 'General service'}</td>
                      <td className="p-4 pr-6">
                        <StatusBadge status={m.status} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'REVIEWS' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            {reviews.map((r) => (
              <div key={r.review_id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900">{r.user_name || 'Customer'}</span>
                  <span className="text-amber-500 font-bold">{r.rating} ★</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{r.comment || 'No comment provided.'}</p>
                <span className="text-[10px] text-slate-400 block mt-2">{formatDateTime(r.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ResourcePassportPage;
