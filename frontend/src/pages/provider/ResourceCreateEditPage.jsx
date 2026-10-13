import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/common/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { resourceApi } from '../../api/resourceApi';
import { categoryApi } from '../../api/categoryApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Save, Briefcase, Tag, DollarSign, MapPin } from 'lucide-react';

const ResourceCreateEditPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price_per_hour: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    let isMounted = true;

    // Load available categories
    categoryApi
      .getCategories()
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data)) {
          setCategories(res.data);
          if (!isEditMode && res.data.length > 0) {
            setFormData((prev) => ({ ...prev, category_id: res.data[0].category_id }));
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load categories', err);
      });

    // If edit mode, load existing resource
    if (isEditMode) {
      resourceApi
        .getResourceById(id)
        .then((res) => {
          if (isMounted && res.success && res.data) {
            const r = res.data;
            setFormData({
              name: r.name || '',
              category_id: r.category_id || '',
              price_per_hour: r.price_per_hour || '',
              location: r.location || '',
              description: r.description || '',
            });
          }
        })
        .catch((err) => {
          setErrorMsg(err.response?.data?.message || 'Failed to load resource details.');
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Resource name is required.');
      return;
    }

    if (!formData.category_id) {
      setErrorMsg('Please select a category.');
      return;
    }

    const price = Number(formData.price_per_hour);
    if (isNaN(price) || price < 0) {
      setErrorMsg('Price per hour must be a valid non-negative number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        owner_id: user?.user_id,
        category_id: Number(formData.category_id),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        location: formData.location.trim() || null,
        price_per_hour: price,
      };

      if (isEditMode) {
        const res = await resourceApi.updateResource(id, payload);
        if (res.success) {
          success('Resource updated successfully!', 'Changes Saved');
          navigate('/provider/resources');
        }
      } else {
        const res = await resourceApi.createResource(payload);
        if (res.success) {
          success('Resource registered in your fleet!', 'Equipment Registered');
          navigate('/provider/resources');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save resource.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout withSidebar>
        <div className="py-20 flex justify-center">
          <LoadingSpinner text="Loading equipment details..." size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout withSidebar>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to="/provider/resources"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to fleet inventory
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              {isEditMode ? 'Modify Equipment' : 'Fleet Registration'}
            </span>
            <h1 className="font-heading font-extrabold text-2xl text-slate-900">
              {isEditMode ? `Edit Resource #${id}` : 'Register New Resource'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure parameters, category classification, and hourly rental rates.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Resource Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Deere 5075E Tractor with Loader"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category Classification <span className="text-rose-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50 text-slate-800"
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Price Per Hour ($) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="text-slate-400 text-xs absolute left-3.5 top-1/2 -translate-y-1/2">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="price_per_hour"
                    value={formData.price_per_hour}
                    onChange={handleChange}
                    placeholder="45.00"
                    required
                    className="w-full pl-8 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Physical Location / Facility
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. North Bay Equipment Depot, Bay 4"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Technical Description & Operating Terms
              </label>
              <textarea
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Include maintenance state, power rating, attachment compatibility, pickup requirements..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50 resize-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                to="/provider/resources"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Equipment' : 'Register Equipment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default ResourceCreateEditPage;
