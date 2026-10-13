import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/common/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { resourceApi } from '../../api/resourceApi';
import { useToast } from '../../context/ToastContext';
import {
  Briefcase,
  Search,
  Trash2,
  FileText,
  ExternalLink,
  Shield,
  Tag,
  MapPin,
} from 'lucide-react';

const AdminResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { success, error: toastError } = useToast();

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const res = await resourceApi.getResources();
      if (res.success && Array.isArray(res.data)) {
        setResources(res.data);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load platform resources.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleDelete = async () => {
    if (!resourceToDelete) return;
    setIsDeleting(true);
    try {
      const res = await resourceApi.deleteResource(resourceToDelete.resource_id);
      if (res.success) {
        success('Resource deleted from system.', 'Action Completed');
        setResourceToDelete(null);
        loadResources();
      }
    } catch (err) {
      toastError(
        err.response?.data?.message ||
          'Failed to delete resource. Ensure no active bookings or maintenance records exist.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = resources.filter((r) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      r.name?.toLowerCase().includes(query) ||
      r.location?.toLowerCase().includes(query) ||
      r.category_name?.toLowerCase().includes(query) ||
      String(r.resource_id).includes(query) ||
      String(r.owner_id).includes(query)
    );
  });

  return (
    <AppLayout withSidebar>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
              Admin Console
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Platform Equipment Oversight
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Inspect all registered provider fleet resources, audit equipment passports, and remove inactive units.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, owner ID, or facility..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Retrieving platform equipment catalog..." size="lg" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="p-4 pl-6">ID</th>
                    <th className="p-4">Owner Ref</th>
                    <th className="p-4">Equipment Unit</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Rate</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((r) => (
                    <tr key={r.resource_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-slate-500">
                        #{r.resource_id}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        Owner #{r.owner_id}
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/resources/${r.resource_id}`}
                          className="font-bold text-slate-900 hover:text-amber-600 transition-colors block text-sm font-heading"
                        >
                          {r.name}
                        </Link>
                        <span className="text-[11px] text-slate-400">
                          {r.location || 'Local facility'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {r.category_name}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900 font-heading">
                        ${Number(r.price_per_hour).toFixed(2)}/hr
                      </td>
                      <td className="p-4">
                        <StatusBadge status={r.status} size="xs" />
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/provider/passport/${r.resource_id}`}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Audit Passport"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Passport
                          </Link>

                          <button
                            onClick={() => setResourceToDelete(r)}
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
            title="No equipment matched"
            description="Adjust your search criteria to locate matching units."
          />
        )}
      </div>

      <ConfirmModal
        isOpen={!!resourceToDelete}
        onClose={() => setResourceToDelete(null)}
        onConfirm={handleDelete}
        title="Admin Resource Removal"
        message={`Are you sure you want to permanently delete "${resourceToDelete?.name}" (ID #${resourceToDelete?.resource_id})? This action cannot be reversed.`}
        confirmText="Confirm Removal"
        isDanger={true}
        isLoading={isDeleting}
      />
    </AppLayout>
  );
};

export default AdminResourcesPage;
