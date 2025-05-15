'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import RatingChart from '@/components/RatingChart';
import Announcements from '@/components/Announcements';
import BigCalendar from '@/components/BigCalendar';

type Therapist = {
  _id: string;
  username: string;
  specialization: string[];
  languages: string[];
  location: {
    city: string;
    country: string;
  };
  email: string;
  phone: string;
};

const TherapistDetailPage = () => {
  const { id } = useParams();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const therapistId = id as string; 
  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        if (!id) return;

        const res = await fetch(`http://localhost:5000/api/therapists/${id}`);
        if (!res.ok) throw new Error('Failed to fetch therapist');
        const data = await res.json();
        setTherapist(data);
      } catch (err) {
        console.error('Therapist fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [id]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!therapist) return <div className="p-4 text-center text-red-500">Therapist not found.</div>;

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-upliftSky py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src="/default-avatar.png"
                alt="Profile"
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <h1 className="text-xl font-semibold">{therapist.username}</h1>
              <p className="text-sm text-gray-500">{therapist.specialization.join(', ')}</p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{therapist.email}</span>
                </div>
                <div className="w-full md:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{therapist.phone}</span>
                </div>
                <div className="w-full md:w-1/3 flex items-center gap-2">
                  <Image src="/location.png" alt="" width={14} height={14} />
                  <span>{therapist.location.city}, {therapist.location.country}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%]">
              <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold">{therapist.specialization.length}</h1>
                <span className="text-sm text-gray-400">Specializations</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%]">
              <Image src="/singleBranch.png" alt="" width={24} height={24} className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold">{therapist.languages.length}</h1>
                <span className="text-sm text-gray-400">Languages</span>
              </div>
            </div>
          </div>
        </div>

        {/* CALENDAR */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1 className="font-semibold text-lg mb-2">Appointments</h1>
          <BigCalendar therapistId={therapistId} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <RatingChart />
        <Announcements />
      </div>
    </div>
  );
};

export default TherapistDetailPage;
