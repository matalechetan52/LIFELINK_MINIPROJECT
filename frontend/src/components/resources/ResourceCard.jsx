import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { MapPin, Tag, ArrowRight, ShieldCheck } from 'lucide-react';

const ResourceCard = ({ resource }) => {
  if (!resource) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold tracking-wide">
            <Tag className="w-3 h-3 text-slate-500" />
            {resource.category_name || 'General Equipment'}
          </span>
          <StatusBadge status={resource.status} size="sm" />
        </div>

        {/* Title */}
        <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1 mb-1.5">
          {resource.name}
        </h3>

        {/* Location */}
        {resource.location && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{resource.location}</span>
          </div>
        )}

        {/* Description Excerpt */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {resource.description || 'Verified multi-purpose equipment available for scheduled bookings.'}
        </p>
      </div>

      {/* Pricing & Footer Actions */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">Rate</span>
          <span className="text-base font-extrabold text-slate-900 font-heading">
            ${Number(resource.price_per_hour || 0).toFixed(2)}
            <span className="text-xs font-normal text-slate-500">/hr</span>
          </span>
        </div>

        <Link
          to={`/resources/${resource.resource_id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 transition-all shadow-sm group-hover:gap-2"
        >
          Check & Book
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ResourceCard;
