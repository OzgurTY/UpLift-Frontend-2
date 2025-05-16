'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface RatingFormProps {
  appointment: {
    _id: string;
    therapist: {
      _id: string;
      username: string;
    };
    slot: {
      date: string;
      startTime: string;
      endTime: string;
    };
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const RatingForm: React.FC<RatingFormProps> = ({ appointment, onSuccess, onCancel }) => {
  const [rating, setRating] = useState({
    score: 0,
    comment: '',
    categories: {
      communication: 0,
      professionalism: 0,
      helpfulness: 0,
      knowledge: 0
    },
    isAnonymous: false
  });
  
  const [hoveredScore, setHoveredScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleScoreChange = (score: number) => {
    setRating(prev => ({ ...prev, score }));
  };

  const handleCategoryChange = (category: string, value: number) => {
    setRating(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value
      }
    }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRating(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleAnonymousChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRating(prev => ({ ...prev, isAnonymous: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating.score === 0) {
      setError('Please provide an overall rating');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/ratings/${appointment._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rating)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit rating');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your rating');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryLabels = {
    communication: 'Communication skills',
    professionalism: 'Professionalism',
    helpfulness: 'Helpfulness',
    knowledge: 'Knowledge & expertise'
  };

  const renderStars = (
    score: number, 
    hovered: number, 
    onChange: (score: number) => void, 
    onHover?: (score: number) => void
  ) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => onHover && onHover(star)}
            onMouseLeave={() => onHover && onHover(0)}
            className="focus:outline-none"
          >
            <svg 
              className={`w-8 h-8 ${
                star <= (hovered || score) 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`} 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Rate Your Session</h2>
      <div className="mb-4">
        <p className="text-gray-600">Therapist: {appointment.therapist.username}</p>
        <p className="text-gray-600">
          Date: {new Date(appointment.slot.date).toLocaleDateString()}
        </p>
        <p className="text-gray-600">
          Time: {appointment.slot.startTime} - {appointment.slot.endTime}
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">
            Overall Rating
          </label>
          <div className="flex items-center">
            {renderStars(
              rating.score, 
              hoveredScore, 
              handleScoreChange, 
              setHoveredScore
            )}
            <span className="ml-2 text-gray-600">
              {hoveredScore > 0 
                ? ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoveredScore - 1] 
                : rating.score > 0 
                  ? ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating.score - 1]
                  : ''}
            </span>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-3">Rate Specific Aspects</h3>
          <div className="space-y-4">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <label className="text-gray-700 mb-1 sm:mb-0">{label}</label>
                <div>
                  {renderStars(
                    rating.categories[key as keyof typeof rating.categories], 
                    0,
                    (score) => handleCategoryChange(key, score)
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">
            Your Review (Optional)
          </label>
          <textarea
            value={rating.comment}
            onChange={handleCommentChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Share your experience with this therapist..."
          ></textarea>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              checked={rating.isAnonymous}
              onChange={handleAnonymousChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="anonymous" className="ml-2 text-gray-700">
              Submit anonymously
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your name won't be displayed with your rating if you choose this option.
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
              submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatingForm;