'use client';

import Announcements from '@/components/Announcements';
import BigCalendar from '@/components/BigCalendar';
import RatingChart from '@/components/RatingChart';
import MoodForm from '@/components/MoodForm'
import GoalForm from '@/components/GoalForm'
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface UserData {
  username: string;
  email: string;
  bloodType?: string;
  joinedAt?: string;
  phone?: string;
}

const SinglePatientPage = () => {
  const [user, setUser] = useState<UserData | null>(null);

useEffect(() => {
  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const res = await fetch('http://localhost:5001/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    console.log("Fetched user data:", data); // 👈 Bu satırı geçici olarak ekle

    if (res.ok) setUser(data);
  };

  fetchUser();
}, []);


  return (
    <div className='flex-1 p-4 flex flex-col gap-4 xl:flex-row'>
      {/* LEFT */}
      <div className='w-full xl:w-2/3'>
        {/* TOP */}
        <div className='flex flex-col lg:flex-row gap-4'>
          {/* USER INFO CARD */}
          <div className='bg-upliftSky py-6 px-4 rounded-md flex-1 flex gap-4'>
            <div className='w-1/3'>
              <Image
                src='/default-avatar.png'
                alt=''
                width={144}
                height={144}
                className='w-36 h-36 rounded-full object-cover'
              />
            </div>
            <div className='w-2/3 flex flex-col justify-between gap-4'>
              <h1 className='text-xl font-semibold'>
                {user?.username || 'Loading...'}
              </h1>
              <p className='text-sm text-gray-500'>
                Bu kullanıcı hakkında açıklama henüz yok.
              </p>
              <div className='flex items-center justify-between gap-2 flex-wrap text-xs font-medium'>
                <div className='w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2'>
                  <Image src='/blood.png' alt='' width={14} height={14} />
                  <span>{user?.bloodType || 'A+'}</span>
                </div>
                <div className='w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2'>
                  <Image src='/date.png' alt='' width={14} height={14} />
                  <span>{user?.joinedAt || 'Ocak 2025'}</span>
                </div>
                <div className='w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2'>
                  <Image src='/mail.png' alt='' width={14} height={14} />
                  <span>{user?.email}</span>
                </div>
                <div className='w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2'>
                  <Image src='/phone.png' alt='' width={14} height={14} />
                  <span>{user?.phone || '1 234 567'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SMALL CARDS */}
          <div className='flex-1 flex gap-4 justify-between flex-wrap'>
            <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%]'>
              <Image src='/singleAttendance.png' alt='' width={24} height={24} className='w-6 h-6' />
              <div>
                <h1 className='text-xl font-semibold'>1</h1>
                <span className='text-sm text-gray-400'>Specialization</span>
              </div>
            </div>
            <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%]'>
              <Image src='/singleBranch.png' alt='' width={24} height={24} className='w-6 h-6' />
              <div>
                <h1 className='text-xl font-semibold'>2</h1>
                <span className='text-sm text-gray-400'>Language</span>
              </div>
            </div>
            <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%]'>
              <Image src='/singleLesson.png' alt='' width={24} height={24} className='w-6 h-6' />
              <div>
                <h1 className='text-xl font-semibold'>3</h1>
                <span className='text-sm text-gray-400'>Card3</span>
              </div>
            </div>
            <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%]'>
              <Image src='/singleClass.png' alt='' width={24} height={24} className='w-6 h-6' />
              <div>
                <h1 className='text-xl font-semibold'>4</h1>
                <span className='text-sm text-gray-400'>Card4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className='w-full xl:w-1/3 flex flex-col gap-4'>
        <div className='bg-white p-4 rounded-md'>
          <h1 className='text-xl font-semibold'>Shortcuts</h1>
          <div className='mt-4 flex gap-4 flex-wrap text-xs text-gray-500'>
            <Link className='p-3 rounded-md bg-upliftSkyLight' href='/'>Patient&apos;s Assignments</Link>
            <Link className='p-3 rounded-md bg-upliftPurpleLight' href='/'>Patient&apos;s Object2</Link>
            <Link className='p-3 rounded-md bg-upliftYellowLight' href='/'>Patient&apos;s Object3</Link>
            <Link className='p-3 rounded-md bg-pink-50' href='/'>Patient&apos;s Object4</Link>
          </div>
        </div>
        <RatingChart />
        <MoodForm />
        <GoalForm />
        <Announcements />
      </div>
    </div>
  );
};

export default SinglePatientPage;
