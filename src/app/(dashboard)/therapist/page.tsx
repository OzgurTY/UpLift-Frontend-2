'use client';

import { useEffect, useState } from 'react';
import Announcements from '@/components/Announcements';
import BigCalendar from '@/components/BigCalendar';
import EventCalendar from '@/components/EventCalendar';
import SlotCreationModal from '@/components/SlotCreationModal';
import Image from 'next/image';

type Therapist = {
  id: string;
  username: string;
  email: string;
  role: string;
  phone?: string;
  specialization?: string[];
  languages?: string[];
  location?: {
    city: string;
    country: string;
  };
};

const TherapistPage = () => {
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [therapistId, setTherapistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshCalendar, setRefreshCalendar] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:5001/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch user data');

        const data: Therapist = await res.json();

        if (data.role === 'therapist') {
          console.log('User data:', data);
          setTherapist(data);
          setTherapistId(data.id);
        }
      } catch (err) {
        console.error('Therapist fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSlotCreationSuccess = () => {
    // Trigger calendar refresh
    setRefreshCalendar(prev => !prev);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading calendar...</div>;
  }

  if (!therapistId) {
    return <div className="p-4 text-center text-red-500">Therapist ID not found.</div>;
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        {/* CALENDAR */}
        <div className="bg-white p-4 rounded-md h-[800px]">
          <div className="flex justify-between items-center mb-4">
            <h1 className="font-semibold text-lg">Appointments</h1>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span>Add Slot</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <BigCalendar therapistId={therapistId} key={refreshCalendar ? 'refresh' : 'initial'} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <EventCalendar />
        <Announcements />
      </div>

      {/* Slot Creation Modal */}
      <SlotCreationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSlotCreationSuccess}
      />
    </div>
  );
};

export default TherapistPage;