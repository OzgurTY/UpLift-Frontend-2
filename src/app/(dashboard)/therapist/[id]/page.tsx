import React from 'react';
import TherapistProfile from '@/components/Profiles/TherapistProfile';
import { useParams } from 'next/navigation';

const TherapistProfilePage = () => {
  const params = useParams();
  const userId = params.id as string;

  return <TherapistProfile userId={userId} />;
};

export default TherapistProfilePage;