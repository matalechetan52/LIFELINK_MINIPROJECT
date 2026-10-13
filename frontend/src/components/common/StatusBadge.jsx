import React from 'react';

const StatusBadge = ({ status, size = 'sm' }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  const styles = {
    // Booking / General Success
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
    ACTIVE: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20',
    COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',

    // Warnings / Pending / Waiting
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
    WAITING: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20',
    RESERVED: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/20',
    SCHEDULED: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
    ONGOING: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20',

    // Danger / Cancelled / Inactive
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
    FAILED: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
    EXPIRED: 'bg-slate-100 text-slate-500 border-slate-200 ring-slate-600/20',
    UNAVAILABLE: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
    MAINTENANCE: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-600/20',
    INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-600/20',

    // Roles
    ADMIN: 'bg-rose-100 text-rose-800 border-rose-300 ring-rose-600/20 font-semibold',
    OWNER: 'bg-indigo-100 text-indigo-800 border-indigo-300 ring-indigo-600/20 font-semibold',
    USER: 'bg-amber-100 text-amber-800 border-amber-300 ring-amber-600/20 font-semibold',
  }[normalized] || 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20';

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }[size] || 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full border ring-1 ring-inset tracking-wide ${styles} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-1.5 shrink-0" />
      {normalized}
    </span>
  );
};

export default StatusBadge;
