'use client';

import React, { useState } from 'react';
import AppointmentRatingModal from './AppointmentRatingModal';

type Appointment = {
  _id?: string;
  id?: string;
  therapist?: {
    username?: string;
  };
  patient?: {
    username?: string;
  };
  status?: string;
  jitsiRoom?: string;
  slot?: {
    date?: string;
    startTime?: string;
    endTime?: string;
    type?: 'virtual' | 'in_person';
  };
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
};

const AppointmentDetailModal: React.FC<Props> = ({ isOpen, onClose, appointment }) => {
  const [showRatingModal, setShowRatingModal] = useState(false);

  if (!isOpen || !appointment) return null;

  const {
    therapist,
    patient,
    status,
    jitsiRoom,
    slot: slotInfo = {},
  } = appointment;

  const { date, startTime, endTime, type } = slotInfo;

  const hasValidDate = date && startTime && endTime;

  let sessionStart: Date | null = null;
  let sessionEnd: Date | null = null;

  if (hasValidDate) {
    const isoDate = typeof date === 'string' ? date.split('T')[0] : '';
    sessionStart = new Date(`${isoDate}T${startTime}:00`);
    sessionEnd = new Date(`${isoDate}T${endTime}:00`);
  }

  const now = new Date();

  const isJoinTimeValid =
    sessionStart &&
    sessionEnd &&
    now >= new Date(sessionStart.getTime() - 5 * 60 * 1000) &&
    now <= sessionEnd;

  const isSessionCompleted = 
    sessionEnd && 
    now > sessionEnd;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB');
  };

  const handleJoin = () => {
    const appointmentId = appointment._id || appointment.id;

    if (!appointmentId) {
      alert('Appointment ID not found.');
      return;
    }

    if (!isJoinTimeValid) {
      alert('You can only join 5 minutes before the session and until it ends.');
      return;
    }

    window.open(`https://meet.jit.si/uplift_${appointmentId}`, '_blank');
  };

  const handleRateSession = () => {
    setShowRatingModal(true);
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
        <div className="bg-white rounded-md p-6 w-[90%] max-w-md shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Appointment Details</h2>
          <div className="space-y-2">
            <p><strong>Therapist:</strong> {therapist?.username || '-'}</p>
            <p><strong>Patient:</strong> {patient?.username || '-'}</p>
            <p><strong>Date:</strong> {date ? formatDate(date) : '-'}</p>
            <p><strong>Time:</strong> {startTime && endTime ? `${startTime} - ${endTime}` : '- - -'}</p>
            <p><strong>Type:</strong> {type || '-'}</p>
            <p><strong>Status:</strong> {status || '-'}</p>
          </div>

          <div className="mt-6 space-y-3">
            {type === 'virtual' && isJoinTimeValid && (
              <button
                onClick={handleJoin}
                className="block w-full py-2 rounded-md font-medium bg-green-600 text-white hover:bg-green-700"
              >
                Attend Appointment
              </button>
            )}

            {isSessionCompleted && (
              <button
                onClick={handleRateSession}
                className="block w-full py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                Rate This Session
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 rounded-md border text-center font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <AppointmentRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        appointment={appointment}
      />
    </>
  );
};

export default AppointmentDetailModal;