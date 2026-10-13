import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/common/AppLayout';
import ResourceCard from '../../components/resources/ResourceCard';
import { resourceApi } from '../../api/resourceApi';
import { categoryApi } from '../../api/categoryApi';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  Cpu,
  RefreshCw,
  Search,
  CheckCircle,
} from 'lucide-react';

const LandingPage = () => {
  const [featuredResources, setFeaturedResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([resourceApi.getResources(), categoryApi.getCategories()])
      .then(([resRes, catRes]) => {
        if (!isMounted) return;
        if (resRes.success && Array.isArray(resRes.data)) {
          setFeaturedResources(resRes.data.slice(0, 6));
        }
        if (catRes.success && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load landing data:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppLayout>
      {/* Hero Section - Deep Navy with Gold accents */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-16 mb-16 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Universal Equipment Sharing & Predictive Queue
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] mb-6">
            Share and reserve heavy equipment{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              without downtime.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-2xl font-sans">
            LifeLink delivers instant equipment booking, automated conflict checking, and our proprietary{' '}
            <strong className="text-amber-300 font-semibold">Dynamic Reservation Queue</strong> that ensures you never miss a slot when resources are in peak demand.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02]"
            >
              Explore Equipment Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
            >
              Create Customer Account
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-slate-800/80">
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-amber-400 font-heading">
                100%
              </span>
              <span className="text-xs text-slate-400">Conflict Guard</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-amber-400 font-heading">
                Dynamic
              </span>
              <span className="text-xs text-slate-400">Queue Priority</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-amber-400 font-heading">
                Lifecycle
              </span>
              <span className="text-xs text-slate-400">Resource Passport</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      {categories.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900">
                Resource Categories
              </h2>
              <p className="text-xs text-slate-500">
                Browse certified heavy machinery, technical tools, and shared equipment.
              </p>
            </div>
            <Link
              to="/resources"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.category_id}
                to={`/resources?category=${cat.category_id}`}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-300 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors mb-1">
                    {cat.category_name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {cat.description || 'Equipped for verified reservations.'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Equipment Marketplace */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900">
              Available for Immediate Reservation
            </h2>
            <p className="text-xs text-slate-500">
              Check real-time period availability and lock in hourly rates.
            </p>
          </div>
          <Link
            to="/resources"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            See full inventory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : featuredResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map((res) => (
              <ResourceCard key={res.resource_id} resource={res} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No equipment currently published.</p>
          </div>
        )}
      </section>

      {/* LifeLink Architectural Advantages */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-16 border border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
            Engineered For Zero Downtime
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white mb-4">
            How LifeLink Solves Equipment Scarcity
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            High-demand resources often suffer from conflicting bookings and idle maintenance windows. LifeLink coordinates the entire lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold mb-4 shadow">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-white mb-2">
              Dynamic Reservation Queue
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When an item is booked, join the queue. If the prior booking cancels or ends early, you are seamlessly bumped into eligible reservation status.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold mb-4 shadow">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-white mb-2">
              Next-Available Prediction
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Intelligent scheduling algorithms scan existing reservations and ongoing maintenance schedules to automatically calculate the next earliest opening.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold mb-4 shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-white mb-2">
              Resource Passport Audit
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every equipment unit maintains an immutable lifecycle log containing booking history, maintenance repairs, and verified customer ratings.
            </p>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default LandingPage;
