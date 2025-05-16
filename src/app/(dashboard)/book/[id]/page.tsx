'use client';

import TherapistViewPage from '@/components/TherapistViewPage';
import { useParams } from 'next/navigation';

const BookTherapistPage = () => {
  const params = useParams();
  return <TherapistViewPage />;
};

export default BookTherapistPage;