'use client';

import React, { useEffect, useState } from 'react';
import AppointmentRatingModal from './AppointmentRatingModal';

interface SessionRatingPromptProps {
  userId: string;
}

const SessionRatingPrompt: React.FC<SessionRatingPromptProps> = ({ userId }) => {
  const [unratedAppointments, setUnratedAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchAppointments();
    }
  }, [userId]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;

      // Fetch user's appointments
      const appointmentsResponse = await fetch('http://localhost:5001/api/appointments/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!appointmentsResponse.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const appointments = await appointmentsResponse.json();
      
      // Filter for completed appointments (sessions in the past)
      const now = new Date();
      const completedAppointments = appointments.filter((appointment: any) => {
        const slot = appointment.slot;
        if (!slot || !slot.date || !slot.endTime) return false;
        
        const endTime = new Date(`${slot.date.split('T')[0]}T${slot.endTime}:00`);
        return endTime < now && appointment.status === 'booked';
      });

      if (completedAppointments.length === 0) {
        setUnratedAppointments([]);
        return;
      }

      // Fetch user's ratings to find unrated appointments
      const ratingsResponse = await fetch('http://localhost:5001/api/ratings/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!ratingsResponse.ok) {
        throw new Error('Failed to fetch ratings');
      }

      const ratings = await ratingsResponse.json();
      
      // Get appointment IDs that have already been rated
      const ratedAppointmentIds = ratings.map((rating: any) => 
        rating.appointment?._id || rating.appointment
      );

      // Filter for appointments that haven't been rated yet
      const unrated = completedAppointments.filter((appointment: any) => 
        !ratedAppointmentIds.includes(appointment._id)
      );

      setUnratedAppointments(unrated);
    } catch (error) {
      console.error('Error fetching unrated appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRateNow = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    fetchAppointments(); // Refresh the list after rating
  };

  if (loading || unratedAppointments.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 max-w-sm">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-lg text-gray-800">Rate Your Sessions</h3>
            <button
              onClick={() => setUnratedAppointments([])} // Hide the prompt
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 my-2">
            You have {unratedAppointments.length} {unratedAppointments.length === 1 ? 'session' : 'sessions'} to rate.
            Your feedback helps therapists improve!
          </p>
          <div className="mt-3">
            <button
              onClick={() => handleRateNow(unratedAppointments[0])}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Rate Now
            </button>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {selectedAppointment && (
        <AppointmentRatingModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          appointment={selectedAppointment}
        />
      )}
    </>
  );
};

export default SessionRatingPrompt;