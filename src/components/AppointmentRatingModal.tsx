'use client';

import React, { useState, useEffect } from 'react';
import RatingForm from './RatingForm';

interface AppointmentRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any; // Using any type for simplicity
}

const AppointmentRatingModal: React.FC<AppointmentRatingModalProps> = ({ 
  isOpen, 
  onClose, 
  appointment 
}) => {
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && appointment?._id) {
      checkIfRated();
    }
  }, [isOpen, appointment]);

  const checkIfRated = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setHasRated(false);
        return;
      }

      const response = await fetch('http://localhost:5001/api/ratings/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const ratings = await response.json();
        const alreadyRated = ratings.some((rating: any) => 
          rating.appointment && rating.appointment._id === appointment._id
        );
        setHasRated(alreadyRated);
      }
    } catch (error) {
      console.error('Error checking ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSuccess = () => {
    setHasRated(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Rate Your Session</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Checking rating status...</p>
            </div>
          ) : hasRated ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Thank You!</h3>
              <p className="mt-2 text-gray-600">
                You have already rated this session. We appreciate your feedback!
              </p>
              <div className="mt-4">
                <button
                  onClick={onClose}
                  className="inline-flex justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <RatingForm 
              appointment={appointment} 
              onSuccess={handleRatingSuccess} 
              onCancel={onClose} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentRatingModal;