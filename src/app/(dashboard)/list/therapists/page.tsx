'use client';

import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

type Therapist = {
  _id: string;
  username: string;
  email?: string;
  specialization: string[];
  languages: string[];
  location: {
    city: string;
    country: string;
  };
};

const columns = [
  { header: 'Info', accessor: 'info' },
  { header: 'Specialization', accessor: 'specialization', className: 'hidden md:table-cell' },
  { header: 'Languages', accessor: 'languages', className: 'hidden lg:table-cell' },
  { header: 'Location', accessor: 'location', className: 'hidden lg:table-cell' },
  { header: 'Actions', accessor: 'action' }
];

const TherapistListPage = () => {
  const [data, setData] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/therapists/list');
        const therapists = await res.json();
        setData(therapists);
      } catch (error) {
        console.error('Therapist fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  const renderRow = (item: Therapist) => (
    <tr key={item._id} className='border-b border-x-gray-200 even:bg-slate-50 text-sm hover:bg-upliftPurpleLight'>
      <td className='flex items-center gap-4 p-4'>
        <Image
          src="/default-profile.png"
          alt=''
          width={40}
          height={40}
          className='md:hidden xl:block w-10 h-10 rounded-full object-cover'
        />
        <div className='flex flex-col'>
          <h3 className='font-semibold'>{item.username}</h3>
          <p className='text-xs text-gray-500'>{item.email || 'noemail@uplift.com'}</p>
        </div>
      </td>
      <td className='hidden md:table-cell'>{item.specialization.join(', ')}</td>
      <td className='hidden lg:table-cell'>{item.languages.join(', ')}</td>
      <td className='hidden lg:table-cell'>
        {item.location?.city}, {item.location?.country}
      </td>

      <td>
        <div className='flex flex-row items-center gap-2'>
          <Link href={`/list/therapists/${item._id}`}>
            <button className='w-7 h-7 flex items-center justify-center rounded-full bg-upliftSky'>
              <Image src="/view.png" alt='' width={16} height={16} />
            </button>
          </Link>
        </div>
      </td>
    </tr>
  );

  return (
    <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
      {/* TOP */}
      <div className='flex items-center justify-between'>
        <h1 className='hidden md:block text-lg font-semibold'>All Therapists</h1>
        <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
          <TableSearch />
          <div className='flex items-center gap-4 self-end'>
            <button className='w-8 h-8 flex items-center justify-center rounded-full bg-upliftYellow'>
              <Image src="/filter.png" alt='' width={14} height={14} />
            </button>
            <button className='w-8 h-8 flex items-center justify-center rounded-full bg-upliftYellow'>
              <Image src="/sort.png" alt='' width={14} height={14} />
            </button>
            <button className='w-8 h-8 flex items-center justify-center rounded-full bg-upliftYellow'>
              <Image src="/plus.png" alt='' width={14} height={14} />
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={data} />
      )}

      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default TherapistListPage;
