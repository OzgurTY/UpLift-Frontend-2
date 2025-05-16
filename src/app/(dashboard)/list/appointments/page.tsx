'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';

type Appointment = {
  _id: string;
  therapist: {
    _id: string;
    username: string;
    email: string;
  };
  patient: {
    _id: string;
    username: string;
    email: string;
  };
  slot: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: 'virtual' | 'in_person';
    mode: 'individual' | 'group';
    price: number;
  };
  isPaid: boolean;
  status: 'booked' | 'cancelled' | 'refunded';
  paymentIntentId: string;
  jitsiRoom?: string;
  createdAt: string;
  updatedAt: string;
};

const AppointmentsListPage = () => {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchAppointments();
    
    // Update current time every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('http://localhost:5001/api/appointments/my', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isPaidAppointment = (appointment: Appointment) => {
    return appointment.isPaid && appointment.status === 'booked';
  };

  const isUnpaidAppointment = (appointment: Appointment) => {
    return !appointment.isPaid && appointment.status !== 'cancelled' && appointment.status !== 'refunded';
  };

  const isMeetingStartingSoon = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.slot.date);
    const startTime = appointment.slot.startTime.split(':');
    appointmentDate.setHours(parseInt(startTime[0]), parseInt(startTime[1]));
    
    // Calculate time difference in minutes
    const timeDiffInMinutes = (appointmentDate.getTime() - currentTime.getTime()) / (1000 * 60);
    
    // Return true if the meeting is starting in less than 5 minutes but hasn't started yet
    return timeDiffInMinutes <= 5 && timeDiffInMinutes > -60; // Allow joining up to 60 minutes after start time
  };

  const startMeeting = (jitsiRoom: string) => {
    if (!jitsiRoom) return;
    
    // Open Jitsi meeting in a new tab
    window.open(`https://meet.jit.si/${jitsiRoom}`, '_blank');
  };

  const formatAppointmentDate = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${timeString}`;
  };

  const paidColumns = [
    { header: "Patient", accessor: "patient" },
    { header: "Date & Time", accessor: "dateTime" },
    { header: "Type", accessor: "type" },
    { header: "Actions", accessor: "action" }
  ];

  const unpaidColumns = [
    { header: "Patient", accessor: "patient" },
    { header: "Date & Time", accessor: "dateTime" },
    { header: "Type", accessor: "type" },
    { header: "Status", accessor: "status" }
  ];

  const renderPaidRow = (appointment: Appointment) => (
    <tr key={appointment._id} className='border-b border-x-gray-200 even:bg-slate-50 text-sm hover:bg-upliftPurpleLight'>
      <td className='p-4'>
        <div className='flex flex-col'>
          <h3 className='font-semibold'>{appointment.patient.username}</h3>
          <p className='text-xs text-gray-500'>{appointment.patient.email}</p>
        </div>
      </td>
      <td className='p-4'>
        {formatAppointmentDate(appointment.slot.date, `${appointment.slot.startTime} - ${appointment.slot.endTime}`)}
      </td>
      <td className='p-4'>
        <span className={`px-2 py-1 rounded-full text-xs ${appointment.slot.type === 'virtual' ? 'bg-upliftSkyLight' : 'bg-upliftPurpleLight'}`}>
          {appointment.slot.type === 'virtual' ? 'Virtual Session' : 'In-Person Session'}
        </span>
      </td>
      <td className='p-4'>
        <div className='flex flex-row items-center gap-2'>
          {isMeetingStartingSoon(appointment) && appointment.slot.type === 'virtual' && (
            <button 
              onClick={() => startMeeting(appointment.jitsiRoom || `uplift_${appointment._id}`)}
              className='px-3 py-1 bg-green-600 text-white rounded-md text-xs flex items-center gap-1'
            >
              <Image src="/join.png" alt='' width={14} height={14} />
              Start Meeting
            </button>
          )}
          <button className='w-7 h-7 flex items-center justify-center rounded-full bg-upliftSky'>
            <Image src="/view.png" alt='' width={16} height={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  const renderUnpaidRow = (appointment: Appointment) => (
    <tr key={appointment._id} className='border-b border-x-gray-200 even:bg-slate-50 text-sm hover:bg-upliftPurpleLight'>
      <td className='p-4'>
        <div className='flex flex-col'>
          <h3 className='font-semibold'>{appointment.patient.username}</h3>
          <p className='text-xs text-gray-500'>{appointment.patient.email}</p>
        </div>
      </td>
      <td className='p-4'>
        {formatAppointmentDate(appointment.slot.date, `${appointment.slot.startTime} - ${appointment.slot.endTime}`)}
      </td>
      <td className='p-4'>
        <span className={`px-2 py-1 rounded-full text-xs ${appointment.slot.type === 'virtual' ? 'bg-upliftSkyLight' : 'bg-upliftPurpleLight'}`}>
          {appointment.slot.type === 'virtual' ? 'Virtual Session' : 'In-Person Session'}
        </span>
      </td>
      <td className='p-4'>
        <span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs'>
          Awaiting Payment
        </span>
      </td>
    </tr>
  );

  const paidAppointments = appointments.filter(isPaidAppointment);
  const unpaidAppointments = appointments.filter(isUnpaidAppointment);

  if (loading) {
    return (
      <div className='bg-white p-8 rounded-md flex-1 m-4 mt-0 flex items-center justify-center'>
        <p>Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white p-8 rounded-md flex-1 m-4 mt-0 flex items-center justify-center'>
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  return (
    <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
      {/** TOP */}
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-lg font-semibold'>My Appointments</h1>
        <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
          <TableSearch />
          <div className='flex items-center gap-4 self-end'>
            <button className='w-8 h-8 flex items-center justify-center rounded-full bg-upliftYellow'>
              <Image src="/filter.png" alt='' width={14} height={14} />
            </button>
            <button className='w-8 h-8 flex items-center justify-center rounded-full bg-upliftYellow'>
              <Image src="/sort.png" alt='' width={14} height={14} />
            </button>
          </div>
        </div>
      </div>

      {/** PAID APPOINTMENTS */}
      <div className='mb-8'>
        <h2 className='text-md font-semibold mb-4 text-gray-700 flex items-center'>
          <div className='w-3 h-3 bg-green-500 rounded-full mr-2'></div>
          Paid Appointments
        </h2>
        {paidAppointments.length > 0 ? (
          <Table 
            columns={paidColumns} 
            renderRow={(item) => renderPaidRow(item)} 
            data={paidAppointments} 
          />
        ) : (
          <div className='text-center p-6 bg-gray-50 rounded-lg'>
            <p className='text-gray-500'>No paid appointments found.</p>
          </div>
        )}
      </div>

      {/** UNPAID APPOINTMENTS */}
      <div>
        <h2 className='text-md font-semibold mb-4 text-gray-700 flex items-center'>
          <div className='w-3 h-3 bg-yellow-500 rounded-full mr-2'></div>
          Unpaid Appointments
        </h2>
        {unpaidAppointments.length > 0 ? (
          <Table 
            columns={unpaidColumns} 
            renderRow={(item) => renderUnpaidRow(item)} 
            data={unpaidAppointments} 
          />
        ) : (
          <div className='text-center p-6 bg-gray-50 rounded-lg'>
            <p className='text-gray-500'>No unpaid appointments found.</p>
          </div>
        )}
      </div>

      {/** PAGINATION */}
      <Pagination />
    </div>
  );
};

export default AppointmentsListPage;