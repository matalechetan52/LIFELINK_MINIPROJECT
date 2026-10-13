import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { maintenanceApi } from '../../api/maintenanceApi';
import { resourceApi } from '../../api/resourceApi';
import { useToast } from '../../context/ToastContext';
import { Wrench, PlusCircle, Edit, Trash2, X, AlertTriangle } from 'lucide-react';

const AdminMaintenancePage = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    resource_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    status: 'SCHEDULED',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mRes, rRes] = await Promise.all([
        maintenanceApi.getAllMaintenance(),
        resourceApi.getResources(),
      ]);

      if (mRes.success && Array.isArray(mRes.data)) {
        setMaintenanceRecords(mRes.data);
      }
      if (rRes.success && Array.isArray(rRes.data)) {
        setResources(rRes.data);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load maintenance records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingRecord(null);
    setFormError('');
    setFormData({
      resource_id: resources[0]?.resource_id || '',
      start_date: '',
      end_date: '',
      reason: '',
      status: 'SCHEDULED',
    });
    setModalOpen(true);
  };

  const openEditModal = (rec) => {
    setEditingRecord(rec);
    setFormError('');
    setFormData({
      resource_id: rec.resource_id,
      start_date: rec.start_date ? new Date(rec.start_date).toISOString().slice(0, 16) : '',
      end_date: rec.end_date ? new Date(rec.end_date).toISOString().slice(0, 16) : '',
      reason: rec.reason || '',
      status: rec.status || 'SCHEDULED',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.start_date || !formData.end_date) {
      setFormError('Start date and end date are required.');
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setFormError('End date must be after start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRecord) {
        const res = await maintenanceApi.updateMaintenance(editingRecord.maintenance_id, {
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason.trim() || null,
          status: formData.status,
        });
        if (res.success) {
          success('Maintenance record updated.');
          setModalOpen(false);
          loadData();
        }
      } else {
        const res = await maintenanceApi.createMaintenance({
          resource_id: Number(formData.resource_id),
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason.trim() || null,
        });
        if (res.success) {
          success('Maintenance scheduled.');
          setModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Maintenance action conflicted or failed.';
      setFormError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      const res = await maintenanceApi.deleteMaintenance(recordToDelete.maintenance_id);
      if (res.success) {
        success('Maintenance record deleted.');
        setRecordToDelete(null);
        loadData();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete maintenance.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'N/A';
    try {
      return new Date(dtStr).toLocaleString([], {
        weekday: 'short',
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
    <AppLayout withSidebar>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
              Admin Console
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Platform Maintenance Registry
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Inspect global servicing schedules, conflict locks, and maintenance logs across all equipment units.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-auto hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            Schedule Service
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Retrieving platform servicing records..." size="lg" />
          </div>
        ) : maintenanceRecords.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="p-4 pl-6">ID</th>
                    <th className="p-4">Equipment Unit</th>
                    <th className="p-4">Service Window</th>
                    <th className="p-4">Reason / Notes</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {maintenanceRecords.map((m) => (
                    <tr key={m.maintenance_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-slate-500">
                        #{m.maintenance_id}
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {m.resource_name || `Unit #${m.resource_id}`}
                      </td>
                      <td className="p-4 text-slate-600 text-[11px]">
                        <div>{formatDateTime(m.start_date)}</div>
                        <div className="text-slate-400">to {formatDateTime(m.end_date)}</div>
                      </td>
                      <td className="p-4 text-slate-700 max-w-sm">
                        {m.reason || 'General servicing'}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={m.status} size="xs" />
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {m.status !== 'COMPLETED' && (
                            <button
                              onClick={() => setRecordToDelete(m)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
            icon={Wrench}
            title="No maintenance schedules on file"
            description="All platform equipment units are currently operating without service blocks."
          />
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Service Window Management
                </span>
                <h3 className="font-heading font-bold text-lg text-white">
                  {editingRecord ? `Edit Maintenance #${editingRecord.maintenance_id}` : 'Schedule Maintenance'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingRecord ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Equipment Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.resource_id}
                    onChange={(e) => setFormData({ ...formData, resource_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
                  >
                    {resources.map((r) => (
                      <option key={r.resource_id} value={r.resource_id}>
                        #{r.resource_id} - {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lifecycle Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Start Window <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    End Window <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reason / Technical Details
                </label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Engine servicing, hydraulic replacement, factory warranty review..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50 resize-none"
                />
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingRecord ? 'Save Changes' : 'Schedule Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDelete}
        title="Admin Service Record Removal"
        message={`Are you sure you want to delete maintenance record #${recordToDelete?.maintenance_id}?`}
        confirmText="Confirm Delete"
        isDanger={true}
        isLoading={isDeleting}
      />
    </AppLayout>
  );
};

export default AdminMaintenancePage;
