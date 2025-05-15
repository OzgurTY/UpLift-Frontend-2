'use client';

import React, { useEffect, useState } from 'react';
import PatientProfile from '@/components/Profiles/PatientProfile';
import TherapistProfile from '@/components/Profiles/TherapistProfile';
import { useParams, useRouter } from 'next/navigation';

const ProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/auth/login');
          return;
        }

        try {
          const meResponse = await fetch('http://localhost:5000/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!meResponse.ok) {
            console.error('API Error:', await meResponse.text());
            throw new Error('API connection failed');
          }
          
          const userData = await meResponse.json();
          console.log('User data:', userData);
          
          // Kullanıcı ID'sini ve rolünü al
          const id = params.id || userData.id;
          setUserId(id);
          setUserRole(userData.role);
        } catch (error) {
          console.error('API connection error:', error);
          setError('API connection failed. Please check if the server is running.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error || !userId || !userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md text-center">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Unavailable</h1>
          <p className="text-gray-600 mb-6">{error || 'Failed to fetch profile data'}</p>
          <button 
            onClick={() => {
              if (userRole === 'therapist') {
                router.push('/therapist');
              } else {
                router.push('/patient');
              }
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Kullanıcı rolüne göre uygun profil bileşenini render et
  if (userRole === 'therapist') {
    return <TherapistProfile userId={userId} />;
  } else {
    return <PatientProfile userId={userId} />;
  }
};

export default ProfilePage;