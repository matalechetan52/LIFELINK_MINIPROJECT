import React, { useState } from 'react';
import { availabilityApi } from '../../api/availabilityApi';
import { alternativeApi } from '../../api/alternativeApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Users,
  ChevronRight,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AvailabilityChecker = ({ resource, onInitiateBooking, onInitiateQueue }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [nextAvailable, setNextAvailable] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const { isAuthenticated } = useAuth();
  const { warning } = useToast();

  const handleCheck = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setCheckResult(null);
    setNextAvailable(null);
    setAlternatives([]);

    if (!startTime || !endTime) {
      setErrorMsg('Please select both start and end dates/times.');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      setErrorMsg('End time must be after start time.');
      return;
    }

    setIsChecking(true);
    try {
      // 1. Check availability for requested window
      const res = await availabilityApi.getResourceAvailability(
        resource.resource_id,
        startTime,
        endTime
      );

      if (res.success && res.data) {
        setCheckResult(res.data);

        // 2. If NOT available, look up next available opening and alternative resources
        if (!res.data.available) {
          try {
            const nextRes = await availabilityApi.getNextAvailable(
              resource.resource_id,
              startTime,
              endTime
            );
            if (nextRes.success && nextRes.data) {
              setNextAvailable(nextRes.data);
            }
          } catch (err) {
            console.error('Failed to fetch next available time', err);
          }

          try {
            const altRes = await alternativeApi.getAlternativesForResource(
              resource.resource_id,
              startTime,
              endTime
            );
            if (altRes.success && Array.isArray(altRes.data)) {
              setAlternatives(altRes.data);
            }
          } catch (err) {
            console.error('Failed to fetch alternative resources', err);
          }
        }
      }
    } catch (err) {
      console.error('Availability check error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to check availability.');
    } finally {
      setIsChecking(false);
    }
  };

  const calculateHours = () => {
    if (!startTime || !endTime) return 0;
    const diffMs = new Date(endTime) - new Date(startTime);
    if (diffMs <= 0) return 0;
    return Math.max(1, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
  };

  const hours = calculateHours();
  const estimatedCost = (hours * Number(resource.price_per_hour || 0)).toFixed(2);

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'N/A';
    try {
      return new Date(dtStr).toLocaleString([], {
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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Clock className="w-5 h-5 text-amber-500" />
        <h3 className="font-heading font-bold text-base text-slate-900">
          Check Period Availability & Book
        </h3>
      </div>

      <form onSubmit={handleCheck} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
              required
            />
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={isChecking}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isChecking ? 'Verifying schedule...' : 'Check Availability for Window'}
        </button>
      </form>

      {/* Result Card */}
      {checkResult && (
        <div className="mt-6 pt-5 border-t border-slate-100 animate-in fade-in duration-300">
          {checkResult.available ? (
            /* AVAILABLE STATE */
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                Resource is Available for Requested Period!
              </div>

              <div className="grid grid-cols-2 gap-3 my-3 text-xs bg-white/80 p-3 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-slate-500 block">Total Duration:</span>
                  <span className="font-bold text-slate-800">{hours} hours</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Estimated Cost:</span>
                  <span className="font-bold text-emerald-700 text-sm font-heading">
                    ${estimatedCost}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    warning('Please sign in or create an account to book equipment.');
                  }
                  onInitiateBooking({
                    startTime,
                    endTime,
                    hours,
                    estimatedCost,
                  });
                }}
                className="w-full mt-2 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                Proceed to Confirm Booking
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* UNAVAILABLE STATE -> CONFLICT DETAILS & DYNAMIC QUEUE */
            <div className="space-y-4">
              <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4">
                <div className="flex items-start gap-2.5 text-rose-800 font-bold text-xs mb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span>Unavailable: </span>
                    <span className="font-normal">
                      {checkResult.reason === 'BOOKING_CONFLICT' && 'Already booked by another customer.'}
                      {checkResult.reason === 'MAINTENANCE_CONFLICT' && 'Resource is undergoing scheduled maintenance.'}
                      {checkResult.reason === 'RESOURCE_UNAVAILABLE' && 'Resource status is currently inactive/unavailable.'}
                      {!checkResult.reason && 'Conflicts detected during requested period.'}
                    </span>
                  </div>
                </div>

                {/* Conflict breakdown */}
                {checkResult.booking_conflicts?.length > 0 && (
                  <div className="mt-2 text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-lg border border-rose-100">
                    <span className="font-semibold block mb-1">Conflicting Bookings:</span>
                    {checkResult.booking_conflicts.map((c, i) => (
                      <div key={i} className="text-slate-500">
                        • {formatDateTime(c.start_time)} to {formatDateTime(c.end_time)}
                      </div>
                    ))}
                  </div>
                )}

                {checkResult.maintenance_conflicts?.length > 0 && (
                  <div className="mt-2 text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-lg border border-rose-100">
                    <span className="font-semibold block mb-1 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-orange-500" />
                      Maintenance Window:
                    </span>
                    {checkResult.maintenance_conflicts.map((m, i) => (
                      <div key={i} className="text-slate-500">
                        • {formatDateTime(m.start_date)} to {formatDateTime(m.end_date)} ({m.reason || 'Scheduled service'})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Queue Action CTA */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 border border-slate-700 shadow-md">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="font-heading font-bold text-xs text-white">
                    Dynamic Reservation Queue
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                  Join the queue for this requested time window. LifeLink's predictive priority system locks in your spot, and if the current booking cancels or finishes early, your spot is automatically converted.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      warning('Please sign in to join the reservation queue.');
                    }
                    onInitiateQueue({
                      startTime,
                      endTime,
                    });
                  }}
                  className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                >
                  <Users className="w-3.5 h-3.5" />
                  Join Reservation Queue
                </button>
              </div>

              {/* Next Available Slot Recommendation */}
              {nextAvailable?.available && nextAvailable.next_available_start && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs">
                  <span className="font-bold text-amber-900 block mb-1">
                    ⚡ Recommended Next Available Slot:
                  </span>
                  <p className="text-amber-800">
                    {formatDateTime(nextAvailable.next_available_start)} — {formatDateTime(nextAvailable.next_available_end)}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const s = new Date(nextAvailable.next_available_start).toISOString().slice(0, 16);
                      const e = new Date(nextAvailable.next_available_end).toISOString().slice(0, 16);
                      setStartTime(s);
                      setEndTime(e);
                    }}
                    className="mt-2 text-amber-700 hover:text-amber-900 font-semibold underline text-[11px]"
                  >
                    Use this available slot instead
                  </button>
                </div>
              )}

              {/* Alternative Resources Recommendation */}
              {alternatives.length > 0 && (
                <div className="pt-2">
                  <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center justify-between">
                    <span>Alternative Available Resources:</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      {alternatives.length} found
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {alternatives.slice(0, 3).map((alt) => (
                      <Link
                        key={alt.resource_id}
                        to={`/resources/${alt.resource_id}`}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all text-xs group"
                      >
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                            {alt.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            ${Number(alt.price_per_hour).toFixed(2)}/hr • {alt.location || 'Local'}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailabilityChecker;
