import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { paymentApi } from '../../api/paymentApi';
import { useToast } from '../../context/ToastContext';
import { CreditCard, CheckCircle2, ShieldCheck, ArrowRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const { success, error: toastError } = useToast();

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const res = await paymentApi.getUserPayments();
      if (res.success && Array.isArray(res.data)) {
        setPayments(res.data);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load payments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleConfirmPending = async (paymentId) => {
    setConfirmingId(paymentId);
    try {
      const res = await paymentApi.confirmPayment(paymentId);
      if (res.success) {
        success('Payment confirmed successfully (MVP Simulation)!', 'Payment Completed');
        loadPayments();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to confirm payment.');
    } finally {
      setConfirmingId(null);
    }
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'Pending Confirmation';
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

  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, p) => acc + Number(p.amount || 0), 0);

  return (
    <AppLayout withSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Customer Workspace
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Payment & Transaction Ledger
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verified transaction receipts, gateway status, and simulated settlement audits.
            </p>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center gap-4 self-start sm:self-auto">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Total Settle Amount
              </span>
              <span className="text-xl font-extrabold text-amber-400 font-heading">
                ${totalPaid.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payments Table / Cards */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Loading payment ledger..." size="lg" />
          </div>
        ) : payments.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="p-4 pl-6">Tx ID</th>
                    <th className="p-4">Booking Ref</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date Settled</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.payment_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-slate-800">
                        #{p.payment_id}
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        <Link
                          to="/customer/bookings"
                          className="hover:text-amber-600 underline decoration-slate-300"
                        >
                          Booking #{p.booking_id}
                        </Link>
                      </td>
                      <td className="p-4 font-extrabold text-slate-900 font-heading text-sm">
                        ${Number(p.amount).toFixed(2)}
                      </td>
                      <td className="p-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[11px] font-medium">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={p.status} size="xs" />
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        {formatDateTime(p.paid_at)}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {p.status === 'PENDING' && (
                          <button
                            onClick={() => handleConfirmPending(p.payment_id)}
                            disabled={confirmingId === p.payment_id}
                            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                          >
                            {confirmingId === p.payment_id ? 'Confirming...' : 'Confirm Payment'}
                          </button>
                        )}
                        {p.status === 'PAID' && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                            <ShieldCheck className="w-3.5 h-3.5" /> Settled
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
            icon={CreditCard}
            title="No payment records found"
            description="When you initiate payments for equipment bookings, transaction receipts will be logged here."
          />
        )}
      </div>
    </AppLayout>
  );
};

export default CustomerPaymentsPage;
