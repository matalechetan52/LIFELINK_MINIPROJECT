import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  Calendar,
  Clock,
  CreditCard,
  History,
  Bell,
  Briefcase,
  PlusCircle,
  Wrench,
  BarChart3,
  Shield,
  Layers,
  FileText,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const userLinks = [
    { to: '/customer/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/resources', label: 'Browse Equipment', icon: Search },
    { to: '/customer/bookings', label: 'My Bookings', icon: Calendar },
    { to: '/customer/queue', label: 'Reservation Queue', icon: Clock },
    { to: '/customer/payments', label: 'Payment Ledger', icon: CreditCard },
    { to: '/customer/activity', label: 'Activity History', icon: History },
    { to: '/customer/notifications', label: 'Notifications', icon: Bell },
  ];

  const ownerLinks = [
    { to: '/provider/dashboard', label: 'Provider Overview', icon: LayoutDashboard },
    { to: '/provider/resources', label: 'Fleet Inventory', icon: Briefcase },
    { to: '/provider/resources/new', label: 'Register Resource', icon: PlusCircle },
    { to: '/provider/bookings', label: 'Bookings & Queues', icon: Calendar },
    { to: '/provider/maintenance', label: 'Maintenance Logs', icon: Wrench },
    { to: '/provider/reports', label: 'Performance Reports', icon: BarChart3 },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'System Overview', icon: LayoutDashboard },
    { to: '/admin/resources', label: 'Equipment Oversight', icon: Briefcase },
    { to: '/admin/categories', label: 'Resource Categories', icon: Layers },
    { to: '/admin/bookings', label: 'Bookings & Queue Flow', icon: Calendar },
    { to: '/admin/maintenance', label: 'Maintenance Registry', icon: Wrench },
    { to: '/admin/notifications', label: 'Broadcast Notification', icon: Bell },
    { to: '/admin/reports', label: 'Financial & Usage Reports', icon: BarChart3 },
  ];

  const links = {
    USER: userLinks,
    OWNER: ownerLinks,
    ADMIN: adminLinks,
  }[user.role] || userLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden lg:flex">
      <div>
        <div className="px-3 py-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {user.role} Workspace
          </span>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/customer/dashboard' || link.to === '/provider/dashboard' || link.to === '/admin/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-slate-900 text-amber-400 shadow-sm shadow-slate-900/10'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-slate-700">Dynamic Queue Active</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Predictive reservation and conflict resolution system connected.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
