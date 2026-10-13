import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/common/AppLayout';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <AppLayout>
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading mb-2">404</h2>
          <h3 className="text-base font-bold text-slate-800 mb-2">Page Not Found</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            The page or equipment resource you are searching for might have been relocated or is temporarily inaccessible.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotFoundPage;
