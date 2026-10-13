import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../api/notificationApi';
import StatusBadge from './StatusBadge';
import {
  Sparkles,
  Search,
  Bell,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Layers,
  Calendar,
  Clock,
  CreditCard,
  BarChart3,
  Wrench,
  Shield,
  Briefcase,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, getDashboardPathForRole } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Load unread notification count if user is authenticated
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      notificationApi
        .getNotifications()
        .then((res) => {
          if (isMounted && res.success && Array.isArray(res.data)) {
            const unread = res.data.filter((n) => !n.is_read).length;
            setUnreadCount(unread);
          }
        })
        .catch(() => {
          // silently ignore if notifications endpoint fails
        });
    } else {
      setUnreadCount(0);
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const dashboardPath = user ? getDashboardPathForRole(user.role) : '/login';

  return (
    <nav className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg shadow-slate-950/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                  Life<span className="text-amber-400">Link</span>
                </span>
                <span className="hidden sm:block text-[10px] tracking-widest uppercase font-semibold text-slate-400 -mt-1">
                  Universal Resource Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/resources"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  location.pathname === '/resources'
                    ? 'bg-slate-800 text-amber-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Browse Equipment
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to={dashboardPath}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      location.pathname.includes('/dashboard')
                        ? 'bg-slate-800 text-amber-400'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>

                  {user.role === 'USER' && (
                    <>
                      <Link
                        to="/customer/bookings"
                        className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                          location.pathname.startsWith('/customer/bookings')
                            ? 'bg-slate-800 text-amber-400'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        My Bookings
                      </Link>
                      <Link
                        to="/customer/queue"
                        className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                          location.pathname.startsWith('/customer/queue')
                            ? 'bg-slate-800 text-amber-400'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        Queue Waitlist
                      </Link>
                      <Link
                        to="/customer/activity"
                        className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                          location.pathname.startsWith('/customer/activity')
                            ? 'bg-slate-800 text-amber-400'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        Activity History
                      </Link>
                    </>
                  )}

                  {user.role === 'OWNER' && (
                    <>
                      <Link
                        to="/provider/resources"
                        className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                          location.pathname.startsWith('/provider/resources')
                            ? 'bg-slate-800 text-amber-400'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        My Fleet
                      </Link>
                      <Link
                        to="/provider/bookings"
                        className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                          location.pathname.startsWith('/provider/bookings')
                            ? 'bg-slate-800 text-amber-400'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        Bookings & Queue
                      </Link>
                      <Link
                        to="/provider/reports"
                        className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                          location.pathname.startsWith('/provider/reports')
                            ? 'bg-slate-800 text-amber-400'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        Fleet Analytics
                      </Link>
                    </>
                  )}

                  {user.role === 'ADMIN' && (
                    <>
                      <Link
                        to="/admin/resources"
                        className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                          location.pathname.startsWith('/admin/resources')
                            ? 'bg-slate-800 text-amber-400'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        Resource Control
                      </Link>
                      <Link
                        to="/admin/categories"
                        className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                          location.pathname.startsWith('/admin/categories')
                            ? 'bg-slate-800 text-amber-400'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        Categories
                      </Link>
                      <Link
                        to="/admin/reports"
                        className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                          location.pathname.startsWith('/admin/reports')
                            ? 'bg-slate-800 text-amber-400'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        Platform Reports
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Actions: Notifications & User profile or Auth CTAs */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Notifications Button */}
                <Link
                  to={
                    user.role === 'ADMIN'
                      ? '/admin/notifications'
                      : '/customer/notifications'
                  }
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full ring-2 ring-slate-900 animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-bold text-xs flex items-center justify-center shadow">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden sm:flex flex-col items-start text-left">
                      <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-amber-400 font-medium">
                        {user.role}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <div className="mt-1.5">
                          <StatusBadge status={user.role} size="xs" />
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to={dashboardPath}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          Dashboard
                        </Link>

                        {user.role === 'USER' && (
                          <>
                            <Link
                              to="/customer/bookings"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              My Bookings
                            </Link>
                            <Link
                              to="/customer/payments"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Payments
                            </Link>
                          </>
                        )}

                        {user.role === 'OWNER' && (
                          <Link
                            to="/provider/resources"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                          >
                            <Briefcase className="w-3.5 h-3.5" />
                            Manage Resources
                          </Link>
                        )}

                        {user.role === 'ADMIN' && (
                          <Link
                            to="/admin/reports"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-800 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/40 transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/resources"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <Search className="w-4 h-4 text-amber-400" />
            Browse Equipment
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={dashboardPath}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                Dashboard ({user.role})
              </Link>

              {user.role === 'USER' && (
                <>
                  <Link
                    to="/customer/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <Calendar className="w-4 h-4" />
                    My Bookings
                  </Link>
                  <Link
                    to="/customer/queue"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <Clock className="w-4 h-4" />
                    Queue Status
                  </Link>
                  <Link
                    to="/customer/payments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <CreditCard className="w-4 h-4" />
                    Payments
                  </Link>
                  <Link
                    to="/customer/activity"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Activity History
                  </Link>
                </>
              )}

              {user.role === 'OWNER' && (
                <>
                  <Link
                    to="/provider/resources"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <Briefcase className="w-4 h-4" />
                    My Fleet
                  </Link>
                  <Link
                    to="/provider/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <Calendar className="w-4 h-4" />
                    Bookings & Queue
                  </Link>
                  <Link
                    to="/provider/maintenance"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <Wrench className="w-4 h-4" />
                    Maintenance
                  </Link>
                  <Link
                    to="/provider/reports"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Reports
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/resources"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <Shield className="w-4 h-4" />
                    Resource Operations
                  </Link>
                  <Link
                    to="/admin/categories"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <Layers className="w-4 h-4" />
                    Categories
                  </Link>
                  <Link
                    to="/admin/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <Calendar className="w-4 h-4" />
                    Bookings & Queues
                  </Link>
                  <Link
                    to="/admin/reports"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Admin Reports
                  </Link>
                </>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-semibold text-slate-200 bg-slate-800 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-bold text-slate-950 bg-amber-400 rounded-xl"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
