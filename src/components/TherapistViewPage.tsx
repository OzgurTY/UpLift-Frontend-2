'use client';

import { useEffect, useState } from 'react';
import Announcements from '@/components/Announcements';
import BigCalendar from '@/components/BigCalendar';
import { useParams } from 'next/navigation';
import Image from 'next/image';

type TherapistDetails = {
  id: string;
  username: string;
  email: string;
  specialization: string[];
  languages?: string[];
  location?: {
    city: string;
    country: string;
  };
  description?: string;
};

const TherapistViewPage = () => {
  const params = useParams();
  const [therapist, setTherapist] = useState<TherapistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const therapistId = params.id as string;

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/therapists/${therapistId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch therapist details');
        }
        
        const data = await response.json();
        setTherapist(data);
      } catch (error) {
        console.error('Error fetching therapist details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (therapistId) {
      fetchTherapist();
    }
  }, [therapistId]);

  if (loading) {
    return <div className="p-4 text-center">Loading therapist details...</div>;
  }

  if (!therapist) {
    return <div className="p-4 text-center text-red-500">Therapist not found.</div>;
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        {/* Therapist Profile Card */}
        <div className="bg-white p-6 rounded-md shadow">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 relative">
              <Image 
                src="/default-avatar.png" 
                alt={therapist.username} 
                width={96} 
                height={96} 
                className="rounded-full"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{therapist.username}</h1>
              <p className="text-gray-600 mt-1 mb-2">{therapist.description || 'Professional therapist committed to helping clients achieve their wellness goals.'}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {therapist.specialization?.map((spec, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {spec}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {therapist.location && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {therapist.location.city}, {therapist.location.country}
                  </div>
                )}
                
                {therapist.languages && therapist.languages.length > 0 && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    {therapist.languages.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Calendar */}
        <div className="bg-white p-4 rounded-md h-[700px]">
          <h2 className="text-xl font-semibold mb-4">Available Appointment Slots</h2>
          <p className="text-gray-600 mb-4">
            Click on any available slot to book an appointment with {therapist.username}.
          </p>
          <BigCalendar therapistId={therapistId} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-md shadow">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-semibold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium">Browse Available Slots</p>
                <p className="text-sm text-gray-600">Check the calendar for available appointment times</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-semibold text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium">Book an Appointment</p>
                <p className="text-sm text-gray-600">Click on an available slot and confirm your booking</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-semibold text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium">Secure Payment</p>
                <p className="text-sm text-gray-600">Complete the payment process to confirm your appointment</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-semibold text-blue-600">4</span>
              </div>
              <div>
                <p className="font-medium">Attend Your Session</p>
                <p className="text-sm text-gray-600">You'll receive details for your appointment via email</p>
              </div>
            </div>
          </div>
        </div>
        
        <Announcements />
      </div>
    </div>
  );
};

export default TherapistViewPage;