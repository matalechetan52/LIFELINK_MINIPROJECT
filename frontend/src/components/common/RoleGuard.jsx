import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const RoleGuard = ({ allowedRoles = [], children }) => {
  const { user, isLoading, getDashboardPathForRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner text="Verifying permissions..." />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    const homePath = user ? getDashboardPathForRole(user.role) : '/login';

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-rose-100 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-600 mb-6">
            Your role (<span className="font-semibold text-slate-800">{user?.role || 'Guest'}</span>) does not have authorization to view this area.
          </p>
          <Link
            to={homePath}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Authorized Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleGuard;
