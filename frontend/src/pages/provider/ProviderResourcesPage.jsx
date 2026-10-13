import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/common/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { resourceApi } from '../../api/resourceApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Briefcase,
  PlusCircle,
  Edit,
  Trash2,
  FileText,
  MapPin,
  Tag,
  DollarSign,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const ProviderResourcesPage = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const res = await resourceApi.getResources();
      if (res.success && Array.isArray(res.data)) {
        // Filter to resources owned by this provider
        const myFleet = res.data.filter(
          (r) => Number(r.owner_id) === Number(user?.user_id)
        );
        setResources(myFleet);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to fetch provider fleet.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [user]);

  const handleDelete = async () => {
    if (!resourceToDelete) return;
    setIsDeleting(true);
    try {
      const res = await resourceApi.deleteResource(resourceToDelete.resource_id);
      if (res.success) {
        success('Resource deleted from fleet inventory.', 'Resource Deleted');
        setResourceToDelete(null);
        loadResources();
      }
    } catch (err) {
      toastError(
        err.response?.data?.message ||
          'Failed to delete resource. Ensure there are no active bookings or maintenance schedules associated with it.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout withSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Resource Provider Workspace
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Fleet Inventory Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Register equipment, update specifications, and access immutable Resource Passports.
            </p>
          </div>

          <Link
            to="/provider/resources/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-auto hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Resource
          </Link>
        </div>

        {/* Fleet Table / Grid */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Loading fleet records..." size="lg" />
          </div>
        ) : resources.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="p-4 pl-6">ID</th>
                    <th className="p-4">Equipment Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Hourly Rate</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resources.map((item) => (
                    <tr key={item.resource_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-slate-500">
                        #{item.resource_id}
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/resources/${item.resource_id}`}
                          className="font-bold text-slate-900 hover:text-amber-600 transition-colors block text-sm font-heading"
                        >
                          {item.name}
                        </Link>
                        <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                          {item.description || 'No description'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {item.category_name}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900 font-heading">
                        ${Number(item.price_per_hour).toFixed(2)}/hr
                      </td>
                      <td className="p-4 text-slate-600 text-[11px]">
                        {item.location || 'Local facility'}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={item.status} size="xs" />
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/provider/passport/${item.resource_id}`}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Resource Passport"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Passport
                          </Link>

                          <Link
                            to={`/provider/resources/edit/${item.resource_id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Edit Resource"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => setResourceToDelete(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No equipment registered in your fleet"
            description="Add your first resource to make it available for bookings and queue waitlists."
            action={
              <Link
                to="/provider/resources/new"
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors"
              >
                Register Equipment Now
              </Link>
            }
          />
        )}
      </div>

      <ConfirmModal
        isOpen={!!resourceToDelete}
        onClose={() => setResourceToDelete(null)}
        onConfirm={handleDelete}
        title="Remove Resource from Fleet?"
        message={`Are you sure you want to permanently delete "${resourceToDelete?.name}"? Deletion is only allowed if no historical bookings or maintenance records are associated.`}
        confirmText="Confirm Delete"
        isDanger={true}
        isLoading={isDeleting}
      />
    </AppLayout>
  );
};

export default ProviderResourcesPage;
