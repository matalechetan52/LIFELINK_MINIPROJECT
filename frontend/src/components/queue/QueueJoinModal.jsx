import React, { useState } from 'react';
import { queueApi } from '../../api/queueApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Clock, Calendar, CheckCircle2 } from 'lucide-react';

const QueueJoinModal = ({ isOpen, onClose, resource, queueData, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  if (!isOpen || !resource || !queueData) return null;

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/resources/${resource.resource_id}` } });
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await queueApi.joinQueue({
        resource_id: resource.resource_id,
        user_id: user.user_id,
        requested_start: queueData.startTime,
        requested_end: queueData.endTime,
      });

      if (response.success && response.data) {
        success(
          `You've joined the reservation queue at position #${response.data.queue_position || 'Active'}!`,
          'Queue Position Secured'
        );
        if (onSuccess) {
          onSuccess(response.data);
        }
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to join reservation queue.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return '';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Predictive Reservation System
              </span>
              <h3 className="font-heading font-bold text-lg text-white">
                Join Reservation Queue
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-sm text-slate-900 mb-1">{resource.name}</h4>
            <p className="text-xs text-slate-500">
              {resource.category_name} • ${Number(resource.price_per_hour).toFixed(2)}/hr
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Requested Start:
              </span>
              <span className="font-semibold text-slate-800">
                {formatDateTime(queueData.startTime)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Requested End:
              </span>
              <span className="font-semibold text-slate-800">
                {formatDateTime(queueData.endTime)}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-purple-50/70 border border-purple-200/60 rounded-xl text-purple-950 text-xs space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-purple-900">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              How the LifeLink Dynamic Queue Operates:
            </p>
            <ul className="text-[11px] text-purple-800 space-y-1 pl-4 list-disc leading-relaxed">
              <li>You are assigned an official position in the FIFO / priority queue.</li>
              <li>If the current reservation cancels, finishes early, or fails payment confirmation, your entry becomes next-in-line.</li>
              <li>You can view real-time queue position updates in your Customer Workspace.</li>
            </ul>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
              {errorMsg}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleJoin}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Joining Queue...' : 'Lock In Queue Spot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueJoinModal;
