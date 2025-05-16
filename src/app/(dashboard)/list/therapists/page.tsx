'use client';

import { useEffect, useState } from 'react';
import Image     from 'next/image';
import Link      from 'next/link';

import Pagination  from '@/components/Pagination';
import Table       from '@/components/Table';
import TableSearch from '@/components/TableSearch';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/* -------------------- types -------------------------------------- */
type Location   = { city?:string; country?:string };
type Therapist  = {
  _id:           string;
  username:      string;
  email?:        string;
  specialization:string[];
  languages:     string[];
  location?:     Location;
};
/* ----------------------------------------------------------------- */

const columns = [
  { header:'INFO',           accessor:'info' },
  { header:'SPECIALIZATION', accessor:'specialization', className:'hidden md:table-cell' },
  { header:'LANGUAGES',      accessor:'languages',      className:'hidden lg:table-cell' },
  { header:'LOCATION',       accessor:'location',       className:'hidden lg:table-cell' },
  { header:'ACTIONS',        accessor:'actions' },
];

export default function TherapistListPage() {
  const [rows,    setRows]    = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);

  /* fetch once ------------------------------------------------------ */
  useEffect(() => {
    fetch(`${API}/api/therapists/list`)
      .then(r => r.json())
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- row renderer ---------------------------------- */
  const renderRow = (t:Therapist) => (
    <tr key={t._id}
        className="border-b even:bg-slate-50 text-sm hover:bg-upliftPurpleLight">
      {/* -------- info ---------------------------------------------- */}
      <td className="flex items-center gap-4 px-4 py-3">
        <Image src="/default-avatar.png"
               alt=""
               width={40} height={40}
               className="w-10 h-10 rounded-full object-cover" />
        <div className="space-y-1">
          <h3 className="font-semibold">{t.username || '—'}</h3>
          <p  className="text-xs text-gray-500">
            {t.email || 'noemail@uplift.com'}
          </p>
        </div>
      </td>

      {/* -------- specialization ------------------------------------ */}
      <td className="hidden md:table-cell px-4 py-3">
        {(t.specialization ?? []).join(', ') || '—'}
      </td>

      {/* -------- languages ----------------------------------------- */}
      <td className="hidden lg:table-cell px-4 py-3">
        {(t.languages ?? []).join(', ') || '—'}
      </td>

      {/* -------- location ------------------------------------------ */}
      <td className="hidden lg:table-cell px-4 py-3">
        {t.location?.city || '—'}, {t.location?.country || '—'}
      </td>

      {/* -------- actions ------------------------------------------- */}
      <td className="px-4 py-3">
        <Link href={`/list/therapists/${t._id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-upliftSky">
            <Image src="/view.png" alt="" width={16} height={16} />
          </button>
        </Link>
      </td>
    </tr>
  );

  /* ---------------- render --------------------------------------- */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">
          All Therapists
        </h1>
        <TableSearch />
      </div>

      {loading
        ? <p className="p-4 text-center">Loading…</p>
        : <Table columns={columns} data={rows} renderRow={renderRow} />
      }

      <Pagination />
    </div>
  );
}
