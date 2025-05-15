'use client';

import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';

const localizer = momentLocalizer(moment);

const BigCalendar = ({ therapistId }: { therapistId: string }) => {
  const [events, setEvents] = useState<{ title: string; start: Date; end: Date }[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>('week');

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        if (!therapistId) return;

        const res = await fetch(`http://localhost:5000/api/slot/therapist/${therapistId}`);
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error('Data is not an array');

        const formatted = data.map((slot: any) => {
          return {
            title: slot.status === 'booked' ? 'Booked Appointment' : 'Available Slot',
            start: new Date(slot.start),
            end: new Date(slot.end),
          };
        });

        setEvents(formatted);
      } catch (err) {
        console.error('Calendar fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [therapistId]);

  if (loading) return <p className="text-center">Loading calendar...</p>;

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
        views={['month', 'week', 'day']}
        style={{ height: '100%' }}
        popup
      />
    </div>
  );
};

export default BigCalendar;
