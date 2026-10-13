import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { notificationApi } from '../../api/notificationApi';
import { useToast } from '../../context/ToastContext';
import { Bell, CheckCircle2, Clock, Check } from 'lucide-react';

const CustomerNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const { success, error: toastError } = useToast();

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationApi.getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to fetch notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    setMarkingId(id);
    try {
      const res = await notificationApi.markAsRead(id);
      if (res.success) {
        success('Notification marked as read.');
        setNotifications((prev) =>
          prev.map((n) => (n.notification_id === id ? { ...n, is_read: 1 } : n))
        );
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update notification.');
    } finally {
      setMarkingId(null);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Customer Workspace
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Notification & Alert Center
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Important alerts regarding queue conversions, booking approvals, and system events.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Retrieving notifications..." size="lg" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.notification_id}
                className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  n.is_read
                    ? 'bg-white border-slate-200/80 text-slate-600'
                    : 'bg-amber-50/40 border-amber-200/80 text-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      n.is_read
                        ? 'bg-slate-100 text-slate-400'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        {n.type}
                      </span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </div>
                    <p className="text-xs leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block mt-2">
                      {formatDateTime(n.created_at)}
                    </span>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(n.notification_id)}
                    disabled={markingId === n.notification_id}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white border border-slate-200 shrink-0 flex items-center gap-1 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title="You're all caught up!"
            description="There are no pending alerts or notifications at this time."
          />
        )}
      </div>
    </AppLayout>
  );
};

export default CustomerNotificationsPage;
