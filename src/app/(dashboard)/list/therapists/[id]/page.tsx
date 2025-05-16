'use client';

import { useParams }   from 'next/navigation';
import { useEffect,useState } from 'react';
import Image            from 'next/image';
import BigCalendar      from '@/components/BigCalendar';
import TherapistRatings from '@/components/TherapistRatings';
import Announcements    from '@/components/Announcements';

type Therapist = {
  _id:string; username:string; email?:string; phone?:string;
  specialization:string[]; languages:string[];
  location:{ city:string; country:string };
};

export default function TherapistDetailPage() {
  const { id } = useParams<{id:string}>();
  const [therapist,setTherapist] = useState<Therapist|null>(null);
  const [loading,setLoad]        = useState(true);

  useEffect(()=>{
    if(!id) return;
    fetch(`http://localhost:5001/api/therapists/profile/${id}`)
      .then(r=>r.ok ? r.json() : Promise.reject('404'))
      .then(setTherapist)
      .catch(()=>setTherapist(null))
      .finally(()=>setLoad(false));
  },[id]);

  if(loading)            return <p className="p-6">Loading…</p>;
  if(!therapist)         return <p className="p-6 text-red-500">Therapist not found.</p>;

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* sol sütun */}
      <div className="w-full xl:w-2/3">
        {/* kart */}
        <div className="bg-upliftSky p-6 rounded-md flex gap-4">
          <Image src="/default-avatar.png" alt="" width={144} height={144}
                 className="w-36 h-36 rounded-full object-cover"/>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold">{therapist.username}</h1>
            <p className="text-sm text-gray-600">{therapist.specialization.join(', ')}</p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>{therapist.email}</div>
              <div>{therapist.phone}</div>
              <td className="hidden lg:table-cell">
  {therapist.location?.city ?? '—'}, {therapist.location?.country ?? '—'}
</td>
            </div>
          </div>
        </div>

        {/* takvim */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h2 className="font-semibold mb-2">Appointments</h2>
          <BigCalendar therapistId={therapist._id}/>
        </div>
      </div>

      {/* sağ sütun */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <TherapistRatings therapistId={therapist._id}/>
        <Announcements/>
      </div>
    </div>
  );
}
