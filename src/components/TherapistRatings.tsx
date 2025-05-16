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
      <h2 className="text-xl font-semibold mb-4">Ratings & Reviews</h2>
      
      {/* Overall rating */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <span className="text-3xl font-bold mr-2">{averageRating.toFixed(1)}</span>
          {renderStars(averageRating)}
          <span className="ml-2 text-gray-500">({ratings.length} reviews)</span>
        </div>
        
        {/* Category ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categoryAverages).map(([category, score]) => (
            <div key={category} className="flex justify-between items-center">
              <span className="text-gray-600">{categoryLabels[category]}</span>
              <div className="flex items-center">
                {renderStars(score)}
                <span className="ml-2">{score.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Individual reviews */}
      <div className="space-y-4">
        {ratings.slice(0, displayCount).map((rating, index) => (
          <div key={index} className="border-b pb-4 last:border-0">
            <div className="flex justify-between">
              <div className="font-medium">{rating.userFullName || 'Anonymous'}</div>
              <div className="text-gray-500 text-sm">{formatDate(rating.createdAt)}</div>
            </div>
            <div className="my-2">{renderStars(rating.overallRating)}</div>
            <p className="text-gray-700">{rating.comment}</p>
          </div>
        ))}
      </div>
      
      {ratings.length > displayCount && (
        <button 
          onClick={handleLoadMore}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default TherapistRatings;