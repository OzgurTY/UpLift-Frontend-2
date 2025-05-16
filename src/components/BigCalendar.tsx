'use client';

import { Calendar, momentLocalizer, View, EventProps } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import SlotBookingModal from './SlotBookingModal';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  status?: string;
  resourceId?: string;
  slotInfo?: {
    type: string;
    mode: string;
    price: number;
    maxParticipants: number;
  };
}

interface BigCalendarProps {
  therapistId: string;
}

const BigCalendar: React.FC<BigCalendarProps> = ({ therapistId }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>('week');
  const [isTherapist, setIsTherapist] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<CalendarEvent | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Check if current user is the therapist
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:5001/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const userData = await res.json();
        setIsTherapist(userData.role === 'therapist' && userData.id === therapistId);
      } catch (err) {
        console.error('Error checking user role:', err);
      }
    };

    checkUserRole();
  }, [therapistId]);

  // Fetch slots from API
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        if (!therapistId) return;

        setLoading(true);
        const res = await fetch(`http://localhost:5001/api/slot/therapist/${therapistId}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch slots');
        }
        
        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error('Data is not an array');
        }

        // Format the data for the calendar
        const formattedEvents = data.map((slot: any) => {
          return {
            id: slot.id,
            title: slot.status === 'booked' ? 'Booked Appointment' : 'Available Slot',
            start: new Date(slot.start),
            end: new Date(slot.end),
            status: slot.status,
            slotInfo: slot.slotInfo
          };
        });

        setEvents(formattedEvents);
      } catch (err) {
        console.error('Calendar fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [therapistId]);

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    let style = {
      backgroundColor: event.status === 'available' ? '#C3EBFA' : '#CFCEFF',
      borderRadius: '4px',
      opacity: 0.8,
      color: 'black',
      border: 'none',
      display: 'block',
      cursor: event.status === 'available' && !isTherapist ? 'pointer' : 'default'
    };
    
    return {
      style
    };
  };

  // Handle event click - for booking available slots
  const handleEventClick = (event: CalendarEvent) => {
    if (event.status === 'available' && !isTherapist) {
      setSelectedSlot(event);
      setShowBookingModal(true);
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
          showMore: total => `+ ${total} more`,
        }}
      />

      {/* Booking Modal */}
      <SlotBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        slot={selectedSlot}
        therapistId={therapistId}
      />
    </div>
  );
};

export default BigCalendar;