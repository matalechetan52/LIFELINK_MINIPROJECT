import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { notificationApi } from '../../api/notificationApi';
import { useToast } from '../../context/ToastContext';
import { Bell, Send, User, CheckCircle2, AlertCircle } from 'lucide-react';

const AdminNotificationsPage = () => {
  const [userId, setUserId] = useState('');
  const [type, setType] = useState('SYSTEM_ALERT');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { success, error: toastError } = useToast();

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationApi.getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setRecentNotifications(res.data);
      }
    } catch (err) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const targetId = Number(userId);
    if (!Number.isInteger(targetId) || targetId <= 0) {
      setErrorMsg('Target User ID must be a positive integer.');
      return;
    }

    if (!message.trim()) {
      setErrorMsg('Message content is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await notificationApi.createNotification({
        user_id: targetId,
        type: type.trim(),
        message: message.trim(),
      });

      if (res.success) {
        success(`Notification successfully dispatched to User #${targetId}!`, 'Alert Sent');
        setMessage('');
        loadNotifications();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to dispatch notification.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout withSidebar>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
              Admin Console
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Notification Dispatch Center
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Broadcast critical queue conversion notices, booking updates, and system announcements.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dispatch Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Compose System Notification
                </h3>
                <span className="text-xs text-slate-400">
                  Authorized ADMIN endpoint (POST /api/notifications)
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target User ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. 1, 2, 5"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Notification Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50 text-slate-800"
                >
                  <option value="SYSTEM_ALERT">SYSTEM_ALERT</option>
                  <option value="QUEUE_CONVERSION">QUEUE_CONVERSION</option>
                  <option value="BOOKING_UPDATE">BOOKING_UPDATE</option>
                  <option value="MAINTENANCE_NOTICE">MAINTENANCE_NOTICE</option>
                  <option value="PAYMENT_CONFIRMATION">PAYMENT_CONFIRMATION</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Message Payload <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter the notification message to display in the customer's workspace..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Dispatching...' : 'Dispatch Notification'}
              </button>
            </form>
          </div>

          {/* Recent Dispatches / Activity */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <h3 className="font-heading font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Recent System Alerts & Dispatches
            </h3>

            {isLoading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner text="Loading notifications..." size="md" />
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="space-y-3">
                {recentNotifications.slice(0, 6).map((n) => (
                  <div
                    key={n.notification_id}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-700 uppercase text-[10px] tracking-wider">
                        {n.type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">No recent notifications.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminNotificationsPage;
