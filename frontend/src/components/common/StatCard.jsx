import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'gold', // 'gold', 'navy', 'purple', 'emerald', 'rose'
  trend = null,
}) => {
  const colorStyles = {
    gold: {
      iconBg: 'bg-amber-50 border-amber-200 text-amber-600',
      border: 'hover:border-amber-300',
    },
    navy: {
      iconBg: 'bg-slate-100 border-slate-200 text-slate-800',
      border: 'hover:border-slate-300',
    },
    purple: {
      iconBg: 'bg-purple-50 border-purple-200 text-purple-600',
      border: 'hover:border-purple-300',
    },
    emerald: {
      iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
      border: 'hover:border-emerald-300',
    },
    rose: {
      iconBg: 'bg-rose-50 border-rose-200 text-rose-600',
      border: 'hover:border-rose-300',
    },
  }[color] || {
    iconBg: 'bg-slate-100 border-slate-200 text-slate-800',
    border: 'hover:border-slate-300',
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all duration-200 hover:shadow-md ${colorStyles.border} flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${colorStyles.iconBg}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          {value !== undefined && value !== null ? value : 0}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
            {trend && (
              <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                {trend}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
