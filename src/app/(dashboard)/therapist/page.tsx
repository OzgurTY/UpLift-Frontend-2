'use client';

import { useEffect, useState } from 'react';
import Announcements from '@/components/Announcements';
import BigCalendar from '@/components/BigCalendar';
import EventCalendar from '@/components/EventCalendar';
import Image from 'next/image';

type Therapist = {
  id: string; // ❗️ _id değil, backend'den gelen json'da id olarak ele alınıyor
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

        if (!res.ok) throw new Error('Kullanıcı alınamadı');

        const data: Therapist = await res.json();

        if (data.role === 'therapist') {
          console.log('Kullanıcı verisi:', data);
          setTherapist(data);
          setTherapistId(data.id); // ✅ Burada id doğru alınıyor
        }
      } catch (err) {
        console.error('Therapist fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Takvim yükleniyor...</div>;
  }

  if (!therapistId) {
    return <div className="p-4 text-center text-red-500">Terapist ID bulunamadı.</div>;
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        {/* CALENDAR */}
        <div className="bg-white p-4 rounded-md h-[800px]">
          <h1 className="font-semibold text-lg mb-2">Appointments</h1>
          <BigCalendar therapistId={therapistId} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default TherapistPage;
