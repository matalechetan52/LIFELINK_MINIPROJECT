import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { categoryApi } from '../../api/categoryApi';
import { useToast } from '../../context/ToastContext';
import { Layers, PlusCircle, Edit, Trash2, X, Tag } from 'lucide-react';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await categoryApi.getCategories();
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setDescription('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.category_name);
    setDescription(cat.description || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!categoryName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const res = await categoryApi.updateCategory(editingCategory.category_id, {
          category_name: categoryName.trim(),
          description: description.trim() || null,
        });
        if (res.success) {
          success('Category updated successfully.');
          setModalOpen(false);
          loadCategories();
        }
      } else {
        const res = await categoryApi.createCategory({
          category_name: categoryName.trim(),
          description: description.trim() || null,
        });
        if (res.success) {
          success('Category added to taxonomy.');
          setModalOpen(false);
          loadCategories();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save category.';
      setFormError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      const res = await categoryApi.deleteCategory(categoryToDelete.category_id);
      if (res.success) {
        success('Category deleted.');
        setCategoryToDelete(null);
        loadCategories();
      }
    } catch (err) {
      toastError(
        err.response?.data?.message ||
          'Failed to delete category. Ensure no resources are associated with this category.'
      );
    } finally {
      setIsDeleting(false);
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
              Equipment Categories Registry
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Define standard equipment taxonomies, tractor classifications, generators, and industrial tools.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-auto hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Category
          </button>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Loading taxonomy categories..." size="lg" />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.category_id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-slate-400 text-[10px] font-bold">
                      ID #{cat.category_id}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-slate-900 mb-1">
                    {cat.category_name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                    {cat.description || 'No description provided for this classification.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Edit Category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCategoryToDelete(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Layers}
            title="No categories registered"
            description="Create equipment classification categories to organize the marketplace."
          />
        )}
      </div>

      {/* Category Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Taxonomy Engine
                </span>
                <h3 className="font-heading font-bold text-lg text-white">
                  {editingCategory ? `Edit Category #${editingCategory.category_id}` : 'Create Equipment Category'}
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Agricultural Tractors, Generators"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe typical machinery, use cases, attachment standards..."
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
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Equipment Category?"
        message={`Are you sure you want to delete category "${categoryToDelete?.category_name}"? Deletion is only permitted if no active resources are bound to it.`}
        confirmText="Confirm Delete"
        isDanger={true}
        isLoading={isDeleting}
      />
    </AppLayout>
  );
};

export default AdminCategoriesPage;
