'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Menu = () => {
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setRole(parsedUser.role);
        setUserId(parsedUser.id);
      } catch (err) {
        console.error('User parse error:', err);
      }
    }
  }, []);

  const menuItems = [
    {
      title: 'MENU',
      items: [
        {
          icon: '/home.png',
          label: 'Home',
          getHref: () => {
            if (role === 'therapist') return `/therapist`;
            if (role === 'patient') return `/patient/${userId}`;
            return '/';
          },
          visible: ['admin', 'therapist', 'patient', 'user'],
        },
        {
          icon: '/teacher.png',
          label: 'Therapists',
          href: '/list/therapists',
          visible: ['admin', 'therapist', 'patient'],
        },
        {
          icon: '/subject.png',
          label: 'Appointments',
          href: '/list/appointments',
          visible: ['therapist'],
        },
        {
          icon: '/assignment.png',
          label: 'Assignments',
          href: '/list/assignments',
          visible: ['admin', 'therapist', 'patient'],
        },
        {
          icon: '/calendar.png',
          label: 'Calendar',
          href: '/calendar',
          visible: ['admin', 'therapist', 'patient'],
        },
        {
          icon: '/message.png',
          label: 'Messages',
          href: '/list/messages',
          visible: ['admin', 'therapist', 'patient'],
        },
        {
          icon: '/announcement.png',
          label: 'Announcements',
          href: '/list/announcements',
          visible: ['admin', 'therapist', 'patient'],
        },
      ],
    },
    {
      title: 'OTHER',
      items: [
        {
          icon: '/profile.png',
          label: 'Profile',
          href: '/profile',
          visible: ['admin', 'patient', 'therapist'],
        },
        {
          icon: '/setting.png',
          label: 'Settings',
          href: '/settings',
          visible: ['admin', 'patient', 'therapist'],
        },
        {
          icon: '/logout.png',
          label: 'Logout',
          href: '/logout',
          visible: ['admin', 'patient', 'therapist'],
        },
      ],
    },
  ];

  return (
    <div>
      {menuItems.map((section) => (
        <div className='flex flex-col gap-2' key={section.title}>
          <span className='hidden lg:block text-gray-400 font-light my-4'>{section.title}</span>
          {section.items.map((item) => {
            if (!item.visible.includes(role)) return null;
            const href = item.getHref ? item.getHref() : item.href;
            return (
              <Link
                href={href}
                key={item.label}
                className='flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-upliftSkyLight'
              >
                <Image src={item.icon} alt='' width={20} height={20} />
                <span className='hidden lg:block'>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
