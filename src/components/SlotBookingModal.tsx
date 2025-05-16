'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface SlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: {
    id: string;
    start: Date;
    end: Date;
    slotInfo: {
      type: string;
      mode: string;
      price: number;
      maxParticipants: number;
    };
  } | null;
  therapistId: string;
}

const SlotBookingModal: React.FC<SlotBookingModalProps> = ({ isOpen, onClose, slot, therapistId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  if (!isOpen || !slot) return null;

  const startTime = slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = slot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = slot.start.toLocaleDateString([], { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleBookSlot = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      // Initiate booking process
      const response = await fetch(`http://localhost:5001/api/payment/book/${slot.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking.');
      }
      
      const data = await response.json();
      
      // If the API returns a payment URL, redirect to Stripe
      if (data.url) {
        setPaymentUrl(data.url);
      } else {
        setBookingSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to book the slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If we have a payment URL, redirect user to it
  if (paymentUrl) {
    window.location.href = paymentUrl;
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Book Appointment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {bookingSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Successful!</h3>
              <p className="text-gray-600 mb-4">Your appointment has been successfully booked.</p>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-2">Appointment Details</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{dateFormatted}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">{startTime} - {endTime}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-gray-700">
                      {slot.slotInfo.type === 'virtual' ? 'Virtual Session' : 'In-Person Session'}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-gray-700">
                      {slot.slotInfo.mode === 'individual' ? 'Individual Session' : `Group Session (Max ${slot.slotInfo.maxParticipants} participants)`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="border-t border-b py-4">
                  <div className="flex justify-between items-center text-lg font-medium">
                    <span>Total Price:</span>
                    <span>${slot.slotInfo.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You will be redirected to our secure payment processor after confirming.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookSlot}
                  disabled={loading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlotBookingModal;