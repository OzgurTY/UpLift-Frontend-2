'use client';

import React, { useEffect, useState } from 'react';
import BigCalendar from '@/components/BigCalendar';
import CalendarForPatient from '@/components/CalendarForPatient';
import Announcements from '@/components/Announcements';

const CalendarPage = () => {
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5001/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUserId(userData.id);
          setRole(userData.role);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <div className='flex-1 p-4 flex gap-4 flex-col xl:flex-row'>
      {/* LEFT - Calendar */}
      <div className='w-full xl:w-2/3'>
        <div className='h-full bg-white p-4 rounded-md'>
          <h1 className='text-xl font-semibold mb-4'>Calendar</h1>
          {loading ? (
            <div className="text-center py-20">
              <p>Loading calendar...</p>
            </div>
          ) : (
            <div className="h-[750px]">
              {role === 'patient' ? (
                <CalendarForPatient therapistId={userId || ''} />
              ) : (
                <BigCalendar therapistId={userId || ''} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT - Sidebar */}
      <div className='w-full xl:w-1/3 flex flex-col gap-8'>
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            <div className="p-3 border rounded-md bg-upliftSkyLight">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium">Therapy Session</h3>
                <span className="text-xs text-gray-500">10:00 AM</span>
              </div>
              <p className="text-sm text-gray-600">Session with Dr. Emma Wilson</p>
              <p className="text-xs text-gray-500 mt-1">Tomorrow</p>
            </div>

            <div className="p-3 border rounded-md bg-upliftPurpleLight">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium">Group Therapy</h3>
                <span className="text-xs text-gray-500">2:00 PM</span>
              </div>
              <p className="text-sm text-gray-600">Anxiety Management Group</p>
              <p className="text-xs text-gray-500 mt-1">May 18, 2025</p>
            </div>

            <div className="p-3 border rounded-md bg-upliftYellowLight">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium">Wellness Check-in</h3>
                <span className="text-xs text-gray-500">11:30 AM</span>
              </div>
              <p className="text-sm text-gray-600">Regular check-in appointment</p>
              <p className="text-xs text-gray-500 mt-1">May 20, 2025</p>
            </div>
          </div>
        </div>

        <Announcements />
      </div>
    </div>
  );
};

export default CalendarPage;
