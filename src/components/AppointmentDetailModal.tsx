'use client';

import React from 'react';

const AppointmentDetailModal = ({ isOpen, onClose, appointment }) => {
  if (!isOpen || !appointment) return null;

  const { therapist, patient, status, jitsiRoom, slotInfo } = appointment;
  const { date, startTime, endTime, type } = slotInfo || {};

  // Tarih ve saatleri kontrol et
  const hasValidDate = date && startTime && endTime;

  let sessionStart = null;
  let sessionEnd = null;
  if (hasValidDate) {
    const isoDate = typeof date === 'string' ? date.split('T')[0] : '';
    sessionStart = new Date(`${isoDate}T${startTime}:00`);
    sessionEnd = new Date(`${isoDate}T${endTime}:00`);
  }

  const now = new Date();

  const canAttend =
    type === 'virtual' &&
    sessionStart &&
    sessionEnd &&
    now >= new Date(sessionStart.getTime() - 5 * 60 * 1000) &&
    now <= sessionEnd;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-md p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Appointment Details</h2>
        <div className="space-y-2">
          <p><strong>Therapist:</strong> {therapist?.username || '-'}</p>
          <p><strong>Patient:</strong> {patient?.username || '-'}</p>
          <p><strong>Date:</strong> {date ? formatDate(date) : '-'}</p>
          <p><strong>Time:</strong> {startTime && endTime ? `${startTime} - ${endTime}` : '- - -'}</p>
          <p><strong>Type:</strong> {type || '-'}</p>
          <p><strong>Status:</strong> {status}</p>
        </div>

        {type === 'virtual' && (
          <a
            href={canAttend ? jitsiRoom : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`block mt-6 text-center py-2 rounded-md font-medium ${
              canAttend
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={(e) => {
              if (!canAttend) e.preventDefault();
            }}
          >
            Attend Appointment
          </a>
        )}

        <button
          onClick={onClose}
          className="mt-3 w-full py-2 rounded-md border text-center font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
