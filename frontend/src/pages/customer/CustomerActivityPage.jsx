import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { bookingApi } from '../../api/bookingApi';
import { queueApi } from '../../api/queueApi';
import { paymentApi } from '../../api/paymentApi';
import { notificationApi } from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';
import {
  History,
  Calendar,
  Clock,
  CreditCard,
  Bell,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerActivityPage = () => {
  const { user } = useAuth();
  const [timeline, setTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    let isMounted = true;

    const loadAllActivity = async () => {
      setIsLoading(true);
      try {
        const [bookingsRes, queuesRes, paymentsRes, notifRes] = await Promise.all([
          bookingApi.getAllBookings().catch(() => ({ data: [] })),
          queueApi.getAllQueues().catch(() => ({ data: [] })),
          paymentApi.getUserPayments().catch(() => ({ data: [] })),
          notificationApi.getNotifications().catch(() => ({ data: [] })),
        ]);

        if (!isMounted) return;

        const events = [];

        // 1. Process Bookings
        if (Array.isArray(bookingsRes?.data)) {
          bookingsRes.data
            .filter((b) => Number(b.user_id) === Number(user?.user_id))
            .forEach((b) => {
              events.push({
                id: `booking-${b.booking_id}`,
                type: 'BOOKING',
                title: `Booking #${b.booking_id} — ${b.resource_name || 'Equipment'}`,
                description: `Requested from ${new Date(b.start_time).toLocaleString()} to ${new Date(b.end_time).toLocaleString()}`,
                date: new Date(b.created_at || b.start_time),
                status: b.status,
                amount: b.total_amount,
                link: '/customer/bookings',
              });
            });
        }

        // 2. Process Queues
        if (Array.isArray(queuesRes?.data)) {
          queuesRes.data
            .filter((q) => Number(q.user_id) === Number(user?.user_id))
            .forEach((q) => {
              events.push({
                id: `queue-${q.queue_id}`,
                type: 'QUEUE',
                title: `Joined Queue #${q.queue_id} (Pos #${q.queue_position || 'Active'}) — ${q.resource_name || 'Equipment'}`,
                description: `Requested window: ${new Date(q.requested_start).toLocaleString()} to ${new Date(q.requested_end).toLocaleString()}`,
                date: new Date(q.joined_at || q.requested_start),
                status: q.status,
                link: '/customer/queue',
              });
            });
        }

        // 3. Process Payments
        if (Array.isArray(paymentsRes?.data)) {
          paymentsRes.data.forEach((p) => {
            events.push({
              id: `payment-${p.payment_id}`,
              type: 'PAYMENT',
              title: `Payment #${p.payment_id} (${p.payment_method})`,
              description: `Settlement of $${Number(p.amount).toFixed(2)} for Booking #${p.booking_id}`,
              date: new Date(p.paid_at || new Date()),
              status: p.status,
              amount: p.amount,
              link: '/customer/payments',
            });
          });
        }

        // 4. Process Notifications
        if (Array.isArray(notifRes?.data)) {
          notifRes.data.forEach((n) => {
            events.push({
              id: `notification-${n.notification_id}`,
              type: 'NOTIFICATION',
              title: `System Alert [${n.type}]`,
              description: n.message,
              date: new Date(n.created_at),
              status: n.is_read ? 'READ' : 'UNREAD',
              link: '/customer/notifications',
            });
          });
        }

        // Sort descending by date
        events.sort((a, b) => b.date - a.date);
        setTimeline(events);
      } catch (err) {
        console.error('Failed to construct activity timeline:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAllActivity();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const filteredTimeline = timeline.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'QUEUE':
        return <Clock className="w-4 h-4 text-purple-600" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'NOTIFICATION':
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
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
              Complete Activity Timeline
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Unified chronological history of your bookings, waitlists, payments, and notifications.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold self-start sm:self-auto">
            {['ALL', 'BOOKING', 'QUEUE', 'PAYMENT', 'NOTIFICATION'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filterType === t
                    ? 'bg-slate-900 text-amber-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {t === 'ALL' ? 'Everything' : t}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Generating chronological timeline..." size="lg" />
          </div>
        ) : filteredTimeline.length > 0 ? (
          <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-6 ml-3">
            {filteredTimeline.map((item) => (
              <div key={item.id} className="relative group">
                {/* Dot Icon */}
                <div className="absolute -left-[33px] sm:-left-[41px] top-4 w-8 h-8 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-amber-400 transition-all">
                  {getIcon(item.type)}
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.type}
                      </span>
                      <StatusBadge status={item.status} size="xs" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                    <span className="text-[11px] text-slate-400 block pt-1">
                      {item.date ? item.date.toLocaleString() : 'Recent'}
                    </span>
                  </div>

                  {item.link && (
                    <Link
                      to={item.link}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors shrink-0"
                    >
                      View Record
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={History}
            title="No activity events recorded"
            description="Your reservation events and transactional timeline will appear here as you interact with the platform."
          />
        )}
      </div>
    </AppLayout>
  );
};

export default CustomerActivityPage;
