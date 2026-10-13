import React from 'react';
import { Star, User, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ReviewList = ({ reviews = [], onEdit, onDelete }) => {
  const { user } = useAuth();

  if (!reviews || reviews.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-500">No customer reviews published yet.</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-3">
      {reviews.map((rev) => {
        const isOwner = user && (user.user_id === rev.user_id || user.role === 'ADMIN');
        return (
          <div
            key={rev.review_id}
            className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                  {rev.user_name ? rev.user_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    {rev.user_name || 'Verified Customer'}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {formatDate(rev.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {isOwner && (
                  <div className="flex items-center gap-1 ml-2">
                    {onEdit && user.user_id === rev.user_id && (
                      <button
                        onClick={() => onEdit(rev)}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Edit review"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(rev.review_id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {rev.comment && (
              <p className="text-xs text-slate-600 leading-relaxed pl-10">
                {rev.comment}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;
