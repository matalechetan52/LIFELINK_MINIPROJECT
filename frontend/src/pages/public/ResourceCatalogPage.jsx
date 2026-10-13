import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppLayout from '../../components/common/AppLayout';
import ResourceCard from '../../components/resources/ResourceCard';
import ResourceFilterBar from '../../components/resources/ResourceFilterBar';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { resourceApi } from '../../api/resourceApi';
import { categoryApi } from '../../api/categoryApi';
import { Search, SlidersHorizontal, PackageSearch } from 'lucide-react';

const ResourceCatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';

  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([resourceApi.getResources(), categoryApi.getCategories()])
      .then(([resRes, catRes]) => {
        if (!isMounted) return;
        if (resRes.success && Array.isArray(resRes.data)) {
          setResources(resRes.data);
        }
        if (catRes.success && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch catalog resources:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update URL if category filter changes
  useEffect(() => {
    if (selectedCategory) {
      setSearchParams({ category: selectedCategory });
    } else {
      setSearchParams({});
    }
  }, [selectedCategory, setSearchParams]);

  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      // 1. Search term match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesLoc = item.location?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesLoc) return false;
      }

      // 2. Category match
      if (selectedCategory && Number(item.category_id) !== Number(selectedCategory)) {
        return false;
      }

      // 3. Status match
      if (selectedStatus && item.status !== selectedStatus) {
        return false;
      }

      // 4. Max price match
      if (maxPrice !== '' && Number(item.price_per_hour) > Number(maxPrice)) {
        return false;
      }

      return true;
    });
  }, [resources, searchTerm, selectedCategory, selectedStatus, maxPrice]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setMaxPrice('');
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Universal Equipment Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Browse certified machinery, verify period availability, and reserve on demand.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
            <span>
              Showing <strong className="text-slate-900">{filteredResources.length}</strong> of{' '}
              {resources.length} units
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <ResourceFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          onReset={handleResetFilters}
        />

        {/* Catalog Grid */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Loading equipment directory..." size="lg" />
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => (
              <ResourceCard key={res.resource_id} resource={res} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="No matching equipment found"
            description="Try adjusting your keyword, removing price filters, or clearing category selections."
            action={
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-slate-900 text-amber-400 text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Clear all filters
              </button>
            }
          />
        )}
      </div>
    </AppLayout>
  );
};

export default ResourceCatalogPage;
