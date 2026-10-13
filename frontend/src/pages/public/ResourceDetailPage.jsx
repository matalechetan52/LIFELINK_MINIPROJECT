import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/common/AppLayout';
import AvailabilityChecker from '../../components/resources/AvailabilityChecker';
import BookingModal from '../../components/bookings/BookingModal';
import QueueJoinModal from '../../components/queue/QueueJoinModal';
import ReviewList from '../../components/reviews/ReviewList';
import ReviewModal from '../../components/reviews/ReviewModal';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { resourceApi } from '../../api/resourceApi';
import { reviewApi } from '../../api/reviewApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  MapPin,
  Tag,
  DollarSign,
  Shield,
  Star,
  Clock,
  Layers,
  Calendar,
} from 'lucide-react';

const ResourceDetailPage = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [activeBookingData, setActiveBookingData] = useState(null);
  const [activeQueueData, setActiveQueueData] = useState(null);

  // Review editing state
  const [editingReview, setEditingReview] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const resRes = await resourceApi.getResourceById(id);
      if (resRes.success && resRes.data) {
        setResource(resRes.data);
      } else {
        setErrorMsg('Resource not found.');
      }

      // Reviews endpoint requires authentication in backend
      if (isAuthenticated) {
        try {
          const revRes = await reviewApi.getResourceReviews(id);
          if (revRes.success && Array.isArray(revRes.data)) {
            setReviews(revRes.data);
          }
        } catch {
          // Ignore review fetch if not permitted
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load resource details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, isAuthenticated]);

  const handleInitiateBooking = (bookingData) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/resources/${id}` } });
      return;
    }
    setActiveBookingData(bookingData);
    setBookingModalOpen(true);
  };

  const handleInitiateQueue = (queueData) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/resources/${id}` } });
      return;
    }
    setActiveQueueData(queueData);
    setQueueModalOpen(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await reviewApi.deleteReview(reviewId);
      if (res.success) {
        success('Review removed.');
        setReviews((prev) => prev.filter((r) => r.review_id !== reviewId));
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete review.');
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="py-24 flex justify-center">
          <LoadingSpinner text="Loading equipment specifications..." size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (errorMsg || !resource) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Resource Unavailable</h2>
          <p className="text-xs text-slate-500 mb-6">{errorMsg || 'Equipment not found.'}</p>
          <Link
            to="/resources"
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs"
          >
            Return to Marketplace
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to equipment catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Equipment Specs & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  {resource.category_name}
                </span>
                <StatusBadge status={resource.status} size="md" />
              </div>

              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 mb-3">
                {resource.name}
              </h1>

              {/* Location and rating strip */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-6 mb-6 border-b border-slate-100">
                {resource.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {resource.location}
                  </span>
                )}
                {averageRating && (
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {averageRating} / 5.0 ({reviews.length} reviews)
                  </span>
                )}
                <span className="text-slate-400">Unit ID: #{resource.resource_id}</span>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Equipment Description & Details
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {resource.description || 'Verified multi-purpose equipment ready for reservation.'}
                </p>
              </div>

              {/* Highlights pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Hourly Pricing</span>
                  <span className="font-extrabold text-slate-900 font-heading text-sm">
                    ${Number(resource.price_per_hour).toFixed(2)}/hr
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Reservation Queue</span>
                  <span className="font-semibold text-emerald-700">Predictive Matching</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Provider Ownership</span>
                  <span className="font-semibold text-slate-700">Owner ID #{resource.owner_id}</span>
                </div>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    Customer Reviews
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified ratings from completed equipment bookings.
                  </p>
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-600">
                  <p className="mb-2">Sign in to view verified customer ratings and community reviews.</p>
                  <Link
                    to="/login"
                    className="font-bold text-amber-600 hover:text-amber-700 underline"
                  >
                    Sign in to your account
                  </Link>
                </div>
              ) : (
                <ReviewList
                  reviews={reviews}
                  onEdit={(rev) => {
                    setEditingReview(rev);
                    setReviewModalOpen(true);
                  }}
                  onDelete={handleDeleteReview}
                />
              )}
            </div>
          </div>

          {/* Right Column: Availability & Booking Engine */}
          <div className="space-y-6">
            <AvailabilityChecker
              resource={resource}
              onInitiateBooking={handleInitiateBooking}
              onInitiateQueue={handleInitiateQueue}
            />

            {/* Platform Guarantee Card */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl border border-slate-700 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Shield className="w-4 h-4" />
                LifeLink Queue Guarantee
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bookings are secured in real time with backend conflict inspection. No double-bookings, guaranteed queue integrity, and transparent simulation settlements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        resource={resource}
        bookingData={activeBookingData}
        onSuccess={() => {
          navigate('/customer/bookings');
        }}
      />

      {/* Queue Join Modal */}
      <QueueJoinModal
        isOpen={queueModalOpen}
        onClose={() => setQueueModalOpen(false)}
        resource={resource}
        queueData={activeQueueData}
        onSuccess={() => {
          navigate('/customer/queue');
        }}
      />

      {/* Review Edit Modal */}
      {reviewModalOpen && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setEditingReview(null);
          }}
          existingReview={editingReview}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </AppLayout>
  );
};

export default ResourceDetailPage;
