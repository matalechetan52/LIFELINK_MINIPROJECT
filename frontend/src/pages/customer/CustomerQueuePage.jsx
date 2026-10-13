import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { queueApi } from '../../api/queueApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Clock, Sparkles, XCircle, Calendar, ArrowRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerQueuePage = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [queues, setQueues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedQueueForCancel, setSelectedQueueForCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadQueues = async () => {
    setIsLoading(true);
    try {
      const res = await queueApi.getAllQueues();
      if (res.success && Array.isArray(res.data)) {
        const myQueues = res.data.filter(
          (q) => Number(q.user_id) === Number(user?.user_id)
        );
        setQueues(myQueues);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load reservation queues.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueues();
  }, [user]);

  const handleCancelQueue = async () => {
    if (!selectedQueueForCancel) return;
    setIsCancelling(true);
    try {
      const res = await queueApi.cancelQueue(selectedQueueForCancel.queue_id);
      if (res.success) {
        success('You have exited the reservation queue.', 'Queue Entry Cancelled');
        setSelectedQueueForCancel(null);
        loadQueues();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to cancel queue entry.');
    } finally {
      setIsCancelling(false);
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block mb-1">
              Customer Workspace
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Dynamic Reservation Queue
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your active queue positions, priority scores, and automatic reservation eligibility.
            </p>
          </div>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs hover:bg-slate-800 transition-colors self-start sm:self-auto"
          >
            Browse Resources
          </Link>
        </div>

        {/* Informational Banner */}
        <div className="p-4 bg-gradient-to-r from-purple-900 to-slate-900 text-white rounded-2xl border border-purple-800 shadow-sm flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-400">Queue Automation Protocol:</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              When an existing booking concludes or cancels early, eligible queue entries are prioritised. You will receive real-time notifications in your alerts center.
            </p>
          </div>
        </div>

        {/* Queues List */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Retrieving queue statuses..." size="lg" />
          </div>
        ) : queues.length > 0 ? (
          <div className="space-y-4">
            {queues.map((q) => (
              <div
                key={q.queue_id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Entry #{q.queue_id}
                    </span>
                    <StatusBadge status={q.status} size="sm" />
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                      Queue Position: #{q.queue_position || 'Active'}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-slate-900">
                    {q.resource_name || `Resource #${q.resource_id}`}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Requested Start: {formatDateTime(q.requested_start)}
                    </span>
                    <span className="text-slate-300">→</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Requested End: {formatDateTime(q.requested_end)}
                    </span>
                  </div>

                  {q.priority_score !== undefined && q.priority_score !== null && (
                    <p className="text-[11px] text-slate-500">
                      Calculated Priority Score:{' '}
                      <strong className="text-purple-700">{q.priority_score}</strong>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {q.status === 'WAITING' && (
                    <button
                      onClick={() => setSelectedQueueForCancel(q)}
                      className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Leave Queue
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Clock}
            title="You are not waiting in any reservation queues"
            description="When an equipment unit is booked for your desired dates, join its queue to get in line."
          />
        )}
      </div>

      <ConfirmModal
        isOpen={!!selectedQueueForCancel}
        onClose={() => setSelectedQueueForCancel(null)}
        onConfirm={handleCancelQueue}
        title="Leave Reservation Queue?"
        message={`Are you sure you want to cancel queue entry #${selectedQueueForCancel?.queue_id}? You will surrender your position #${selectedQueueForCancel?.queue_position}.`}
        confirmText="Confirm Exit"
        isDanger={true}
        isLoading={isCancelling}
      />
    </AppLayout>
  );
};

export default CustomerQueuePage;
