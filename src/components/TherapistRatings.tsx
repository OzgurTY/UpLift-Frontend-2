'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface TherapistRatingsProps {
  therapistId: string;
}

const TherapistRatings: React.FC<TherapistRatingsProps> = ({ therapistId }) => {
  const [ratings, setRatings] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [categoryAverages, setCategoryAverages] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [displayCount, setDisplayCount] = useState(3);

  useEffect(() => {
    fetchRatings();
  }, [therapistId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/ratings/therapist/${therapistId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }
      
      const data = await response.json();
      setRatings(data.ratings || []);
      setAverageRating(data.averageRating || 0);
      setCategoryAverages(data.categoryAverages || {});
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayCount(prevCount => prevCount + 3);
  };

  // Helper to render star ratings
  const renderStars = (score: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg 
            key={star} 
            className={`w-4 h-4 ${star <= score ? 'text-yellow-400' : 'text-gray-300'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    communication: 'Communication',
    professionalism: 'Professionalism',
    helpfulness: 'Helpfulness',
    knowledge: 'Knowledge & Expertise'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Client Reviews</h2>
      
      {/* Overall Rating */}
      <div className="mb-6 flex items-center">
        <div className="text-4xl font-bold text-gray-800 mr-3">
          {averageRating.toFixed(1)}
        </div>
        <div>
          <div className="flex items-center mb-1">
            {renderStars(Math.round(averageRating))}
            <span className="ml-1 text-sm text-gray-600">
              ({ratings.length} {ratings.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
      </div>
      
      {/* Category Breakdown */}
      {Object.keys(categoryAverages).length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-3">Rating Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                    <div 
                      className="h-2 bg-blue-600 rounded-full" 
                      style={{ width: `${(categoryAverages[key] / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {categoryAverages[key]?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Review List */}
      {ratings.length > 0 ? (
        <div className="space-y-4">
          {ratings.slice(0, displayCount).map((rating) => (
            <div key={rating._id} className="p-4 border border-gray-100 rounded-lg">
              <div className="flex justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                    <span className="text-sm font-medium text-gray-600">
                      {rating.patient?.username?.[0]?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <span className="font-medium text-gray-800">
                    {rating.patient?.username || 'Anonymous'}
                  </span>
                </div>
                <div>
                  {renderStars(rating.score)}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{rating.comment}</p>
              <p className="text-xs text-gray-500">
                {formatDate(rating.submittedAt || rating.createdAt)}
              </p>
            </div>
          ))}
          
          {ratings.length > displayCount && (
            <div className="text-center">
              <button 
                onClick={handleLoadMore}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Load more reviews
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No reviews yet
        </div>
      )}
    </div>
  );
};

export default TherapistRatings;