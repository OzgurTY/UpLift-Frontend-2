'use client';

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import SlotBookingModal from './SlotBookingModal';
import AppointmentDetailModal from './AppointmentDetailModal';

const localizer = momentLocalizer(moment);

const CalendarForPatient = ({ therapistId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [isTherapist, setIsTherapist] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const parseDateTime = (dateField, time) => {
    const dateStr = typeof dateField === 'string' ? dateField.split('T')[0] : dateField.toISOString().split('T')[0];
    return new Date(`${dateStr}T${time}:00`);
  };

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:5001/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const userData = await res.json();
        setIsTherapist(userData.role === 'therapist' && userData.id === therapistId);
        fetchEvents(userData.role, token);
      } catch (err) {
        console.error('Error checking user role:', err);
      }
    };

    checkUserRole();
  }, [therapistId]);

  const fetchEvents = async (role, token) => {
    try {
      setLoading(true);
      let data = [];

      if (role === 'therapist') {
        const res = await fetch(`http://localhost:5001/api/slot/therapist/${therapistId}`);
        if (!res.ok) throw new Error('Failed to fetch slots');
        const slots = await res.json();

        data = slots.map((slot) => ({
          id: slot._id,
          title: slot.status === 'booked' ? 'Booked Appointment' : 'Available Slot',
          start: parseDateTime(slot.date, slot.startTime),
          end: parseDateTime(slot.date, slot.endTime),
          status: slot.status,
          slotInfo: {
            ...slot.slotInfo,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            type: slot.slotInfo?.type || 'in-person',
          },
          jitsiRoom: slot.jitsiRoom,
        }));
      } else {
        const res = await fetch(`http://localhost:5001/api/appointments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch appointments');
        const appointments = await res.json();

        data = appointments.map((appt) => ({
          id: appt._id,
          title: 'My Appointment',
          start: parseDateTime(appt.slot.date, appt.slot.startTime),
          end: parseDateTime(appt.slot.date, appt.slot.endTime),
          status: appt.status,
          slotInfo: {
            ...appt.slot,
            date: appt.slot.date,
            startTime: appt.slot.startTime,
            endTime: appt.slot.endTime,
            type: appt.slot.type || 'in-person',
          },
          jitsiRoom: appt.jitsiRoom,
          therapist: appt.therapist,
          patient: appt.patient,
        }));
      }

      setEvents(data);
    } catch (err) {
      console.error('Calendar fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: event.status === 'available' ? '#C3EBFA' : '#CFCEFF',
      borderRadius: '4px',
      opacity: 0.8,
      color: 'black',
      border: 'none',
      display: 'block',
      cursor: event.status === 'available' && !isTherapist ? 'pointer' : 'default',
    };

    return { style };
  };

  const handleEventClick = (event) => {
    if (event.status === 'available' && !isTherapist) {
      setSelectedSlot(event);
      setShowBookingModal(true);
    } else {
      setSelectedSlot(event);
      setIsDetailModalOpen(true);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading calendar...</div>;

  return (
    <div className="h-full w-full">
      <Calendar
        localizer={localizer}
        events={events}
        date={date}
        view={view}
        onView={setView}
        onNavigate={setDate}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        style={{ height: '100%' }}
        popup
        tooltipAccessor={(event) => event.title}
        onSelectEvent={handleEventClick}
        messages={{
          event: isTherapist ? 'Appointment' : 'Book Session',
          allDay: 'All Day',
          date: 'Date',
          time: 'Time',
          showMore: (total) => `+ ${total} more`,
        }}
      />

      <SlotBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        slot={selectedSlot}
        therapistId={therapistId}
      />

      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        appointment={selectedSlot}
      />
    </div>
  );
};

export default CalendarForPatient;
