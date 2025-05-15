import React from 'react';
import PatientProfile from '@/components/Profiles/PatientProfile';
import { useParams } from 'next/navigation';

const PatientProfilePage = () => {
  const params = useParams();
  const userId = params.id as string;

  return <PatientProfile userId={userId} />;
};

export default PatientProfilePage;