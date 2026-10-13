import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Cpu, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 shadow">
                <Sparkles className="w-4 h-4 fill-slate-950" />
              </div>
              <span className="font-heading font-extrabold text-lg text-white">
                Life<span className="text-amber-400">Link</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Universal equipment & high-demand resource sharing platform featuring automated conflict detection, predictive dynamic queue scheduling, and verified Resource Passport tracking.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> Secure JWT Auth
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Dynamic Queue
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" /> Predictive Match
              </span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/resources" className="hover:text-amber-400 transition-colors">
                  Resource Catalog
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition-colors">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-amber-400 transition-colors">
                  Customer Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Roles & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-400">Customer (USER) Bookings</span>
              </li>
              <li>
                <span className="text-slate-400">Equipment Provider (OWNER) Fleet</span>
              </li>
              <li>
                <span className="text-slate-400">Platform Management (ADMIN)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} LifeLink Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for enterprise-grade resource sharing with predictive queue intelligence.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
