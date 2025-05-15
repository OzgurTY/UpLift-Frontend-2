'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useRouter } from 'next/navigation';

interface PatientData {
  id: string;
  username: string;
  email: string;
  age?: number;
  gender?: string;
  phone?: string;
  description?: string;
  location?: {
    city: string;
    country: string;
  };
  bloodType?: string;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  preferences?: {
    therapyTypes: string[];
    communicationPreferences: string[];
  };
  createdAt?: string;
}

interface TherapySession {
  id: string;
  therapistName: string;
  therapistId: string;
  date: string;
  time: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

interface ProgressData {
  wellbeingScores: {
    date: string;
    score: number;
  }[];
  moodTracking: {
    date: string;
    mood: string;
    intensity: number;
  }[];
  goals: {
    id: string;
    description: string;
    progress: number;
    completed: boolean;
  }[];
}

const PatientProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'progress' | 'documents'>('overview');
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    router.push('/auth/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

    // Check if viewing own profile
    const userResponse = await fetch('http://localhost:5001/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      setIsCurrentUser(userData.id === userId);
    }

    // Fetch patient profile
    const profileResponse = await fetch(`http://localhost:5001/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const profileData = await profileResponse.json();
        setPatient(profileData);

    // Fetch therapy sessions
    const appointmentsResponse = await fetch(`http://localhost:5001/api/appointments/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });

        if (!appointmentsResponse.ok) {
          throw new Error('Failed to fetch appointments');
        }

        const appointmentsData = await appointmentsResponse.json();
        const mappedSessions = appointmentsData.map((appointment: any) => ({
          id: appointment._id,
          therapistName: appointment.therapist?.username || 'Unknown Therapist',
          therapistId: appointment.therapist?._id,
          date: appointment.slot?.date,
          time: `${appointment.slot?.startTime} - ${appointment.slot?.endTime}`,
          type: appointment.slot?.type === 'virtual' ? 'Virtual Session' : 'In-person Session',
          status: appointment.status === 'booked' ? 'upcoming' : (appointment.status === 'refunded' ? 'cancelled' : 'completed'),
          notes: ''
        }));

        setSessions(mappedSessions);

    // Fetch progress data
    const progressResponse = await fetch('http://localhost:5001/api/progress/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

        if (!progressResponse.ok) {
          throw new Error('Failed to fetch progress data');
        }

        const progressDataFromAPI = await progressResponse.json();

        const formattedProgressData: ProgressData = {
          wellbeingScores: progressDataFromAPI.wellbeingScores || [],
          moodTracking: progressDataFromAPI.moods?.map((mood: any) => ({
            date: mood.date,
            mood: mood.mood,
            intensity: mood.intensity,
          })) || [],
          goals: (progressDataFromAPI.goals || []).map((goal: any) => ({
            id: goal._id,
            description: goal.description,
            progress: goal.progress,
            completed: goal.completed,
          })),
        };

        setProgressData(formattedProgressData);

        setLoading(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Unavailable</h2>
          <p className="text-gray-600 mb-4">{error || 'Patient profile could not be loaded'}</p>
          <Link href="/patient/${userData.id}" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Prepare data for mood distribution chart
  const moodDistributionData = progressData?.moodTracking.reduce((acc: Record<string, number>, item) => {
    acc[item.mood] = (acc[item.mood] || 0) + 1;
    return acc;
  }, {});

  const moodChartData = Object.entries(moodDistributionData || {}).map(([name, value]) => ({ name, value }));
  const MOOD_COLORS = ['#C3EBFA', '#CFCEFF', '#FAE27C', '#F9D0C4', '#D1F7C4'];

  // Sort sessions by date
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const upcomingSessions = sortedSessions.filter(session => session.status === 'upcoming');
  const pastSessions = sortedSessions.filter(session => session.status === 'completed');

  return (
    <div className="flex-1 p-4 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header with Profile Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200">
                <Image 
                  src="/default-avatar.png" 
                  alt={patient.username} 
                  width={112} 
                  height={112} 
                  className="w-full h-full object-cover"
                />
              </div>
              {isCurrentUser && (
                <button 
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md"
                >
                  <Image src="/edit.png" alt="Edit" width={16} height={16} />
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-800">{patient.username}</h1>
                {isCurrentUser && (
                  <div className="flex items-center gap-3 mt-2 md:mt-0">
                    <Link 
                      href="/settings" 
                      className="inline-flex items-center text-blue-600 text-sm font-medium"
                    >
                      <Image src="/settings.png" alt="" width={16} height={16} className="mr-1" />
                      Edit Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="inline-flex items-center text-red-600 text-sm font-medium bg-red-50 py-1 px-3 rounded-md hover:bg-red-100 transition"
                    >
                      <Image src="/logout.png" alt="" width={16} height={16} className="mr-1" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{patient.description || 'No bio provided yet.'}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <Image src="/mail.png" alt="" width={16} height={16} />
                  </div>
                  <span className="text-gray-700">{patient.email}</span>
                </div>
                
                {patient.phone && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                      <Image src="/phone.png" alt="" width={16} height={16} />
                    </div>
                    <span className="text-gray-700">{patient.phone}</span>
                  </div>
                )}
                
                {patient.location && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                      <Image src="/location.png" alt="" width={16} height={16} />
                    </div>
                    <span className="text-gray-700">
                      {patient.location.city}, {patient.location.country}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sessions' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Therapy Sessions
            </button>
            <button 
              onClick={() => setActiveTab('progress')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'progress' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Progress Tracking
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documents
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h2>
                <div className="space-y-4">
                  {patient.age && (
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                        <Image src="/calendar.png" alt="" width={16} height={16} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Age</p>
                        <p className="text-gray-800">{patient.age} years</p>
                      </div>
                    </div>
                  )}
                  
                  {patient.gender && (
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-1">
                        <Image src="/profile.png" alt="" width={16} height={16} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="text-gray-800">{patient.gender}</p>
                      </div>
                    </div>
                  )}

                  {patient.bloodType && (
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 mt-1">
                        <Image src="/blood.png" alt="" width={16} height={16} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Blood Type</p>
                        <p className="text-gray-800">{patient.bloodType}</p>
                      </div>
                    </div>
                  )}

                  {patient.createdAt && (
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                        <Image src="/date.png" alt="" width={16} height={16} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="text-gray-800">{new Date(patient.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800">Emergency Contact</h2>
                  {isCurrentUser && (
                    <button className="text-blue-600 text-sm font-medium">
                      + Add Contact
                    </button>
                  )}
                </div>
                
                {patient.emergencyContact ? (
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                        <Image src="/profile.png" alt="" width={16} height={16} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="text-gray-800">{patient.emergencyContact.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-1">
                        <Image src="/relation.png" alt="" width={16} height={16} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Relationship</p>
                        <p className="text-gray-800">{patient.emergencyContact.relation}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                        <Image src="/phone.png" alt="" width={16} height={16} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-800">{patient.emergencyContact.phone}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No emergency contact added yet</p>
                    {isCurrentUser && (
                      <button className="mt-2 text-blue-600 text-sm font-medium">
                        Add Emergency Contact
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Therapy Preferences Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800">Therapy Preferences</h2>
                  {isCurrentUser && (
                    <button className="text-blue-600 text-sm font-medium">
                      Edit
                    </button>
                  )}
                </div>
                
                {patient.preferences?.therapyTypes?.length ? (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Preferred Therapy Types</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.preferences.therapyTypes.map((type, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Preferred Therapy Types</p>
                    <p className="text-gray-500 italic">No preferences set</p>
                  </div>
                )}

                {patient.preferences?.communicationPreferences?.length ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Communication Preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.preferences.communicationPreferences.map((pref, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Communication Preferences</p>
                    <p className="text-gray-500 italic">No preferences set</p>
                  </div>
                )}
              </div>

              {/* Upcoming Sessions Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800">Upcoming Sessions</h2>
                  <Link href="/appointments" className="text-blue-600 text-sm font-medium">
                    View All
                  </Link>
                </div>
                
                {upcomingSessions.length ? (
                  <div className="space-y-4">
                    {upcomingSessions.slice(0, 2).map(session => (
                      <div key={session.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Image src="/calendar.png" alt="" width={20} height={20} />
                          </div>
                          <div>
                            <p className="font-medium">{session.type}</p>
                            <p className="text-sm text-gray-500">{session.therapistName}</p>
                          </div>
                        </div>
                        <div className="ml-13 pl-13">
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                            <Image src="/date.png" alt="" width={14} height={14} />
                            <span>{new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Image src="/time.png" alt="" width={14} height={14} />
                            <span>{session.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No upcoming sessions scheduled</p>
                    <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                      Book a Session
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-800">Therapy Sessions</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                  Book New Session
                </button>
              </div>

              {/* Upcoming Sessions */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Upcoming Sessions</h3>
                
                {upcomingSessions.length ? (
                  <div className="space-y-4">
                    {upcomingSessions.map(session => (
                      <div key={session.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex items-center gap-4 mb-3 md:mb-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Image src="/calendar.png" alt="" width={24} height={24} />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{session.therapistName}</h4>
                              <p className="text-sm text-gray-600">{session.type}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="font-medium">{new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Time</p>
                              <p className="font-medium">{session.time}</p>
                            </div>
                            
                            <div className="flex gap-2">
                              <button className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition">
                                <Image src="/view.png" alt="View" width={20} height={20} />
                              </button>
                              <button className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition">
                                <Image src="/cancel.png" alt="Cancel" width={20} height={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No upcoming sessions scheduled</p>
                    <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                      Book a Session
                    </button>
                  </div>
                )}
              </div>

              {/* Past Sessions */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Past Sessions</h3>
                
                {pastSessions.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Therapist
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pastSessions.map(session => (
                          <tr key={session.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{session.therapistName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{session.time}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{session.type}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500">{session.notes || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button className="text-blue-600 hover:text-blue-800">
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No past sessions yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Tracking Tab */}
          {activeTab === 'progress' && progressData && (
            <div className="space-y-6">
              {/* Wellbeing & Mood Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Wellbeing Trends */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Wellbeing Score Trend</h2>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Wellbeing score chart would be displayed here</p>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Current Score</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {progressData?.wellbeingScores?.length
                          ? `${progressData.wellbeingScores[progressData.wellbeingScores.length - 1].score}/10`
                          : 'No data'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-500">30-Day Change</p>
                      <div className="flex items-center">
                        <span className="text-green-600 mr-1">+1.5</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mood Distribution */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Mood Distribution</h2>
                  <div className="h-64 flex items-center justify-center">
                    {moodChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={moodChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {moodChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={MOOD_COLORS[index % MOOD_COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-500">No mood data available</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Recent Moods</p>
                    <div className="flex flex-wrap gap-2">
                      {progressData.moodTracking.slice(0, 3).map((mood, idx) => (
                        <div key={idx} className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
                          <span className="text-sm text-gray-800 mr-1">{mood.mood}</span>
                          <span className="text-xs text-gray-500">({mood.intensity}/10)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-800">Therapy Goals</h2>
                  {isCurrentUser && (
                    <button className="text-blue-600 text-sm font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add New Goal
                    </button>
                  )}
                </div>

                {progressData.goals.length > 0 ? (
                  <div className="space-y-6">
                    {progressData.goals.map(goal => (
                      <div key={goal.id} className={`p-4 border rounded-lg ${goal.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-start">
                          <div className={`mt-1 w-5 h-5 rounded-full flex-shrink-0 ${goal.completed ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                            {goal.completed && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between items-start">
                              <p className={`font-medium ${goal.completed ? 'text-green-800' : 'text-gray-800'}`}>{goal.description}</p>
                              {!goal.completed && isCurrentUser && (
                                <button className="text-sm text-blue-600">
                                  Update
                                </button>
                              )}
                            </div>
                            {!goal.completed && (
                              <div className="mt-2">
                                <div className="flex items-center">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                      className="bg-blue-600 h-2.5 rounded-full" 
                                      style={{ width: `${goal.progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="ml-2 text-sm text-gray-500">{goal.progress}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No goals set yet</p>
                    {isCurrentUser && (
                      <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                        Set Your First Goal
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-800">Therapy Documents</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                  Upload Document
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Image src="/pdf.png" alt="" width={24} height={24} />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">Anxiety Management Workbook</p>
                      <p className="text-xs text-gray-500">PDF • Uploaded on May 12, 2025</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition">
                      <Image src="/download.png" alt="Download" width={20} height={20} />
                    </button>
                    <button className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition">
                      <Image src="/delete.png" alt="Delete" width={20} height={20} />
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Image src="/doc.png" alt="" width={24} height={24} />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">Therapy Journal Template</p>
                      <p className="text-xs text-gray-500">DOCX • Uploaded on April 28, 2025</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition">
                      <Image src="/download.png" alt="Download" width={20} height={20} />
                    </button>
                    <button className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition">
                      <Image src="/delete.png" alt="Delete" width={20} height={20} />
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Image src="/form.png" alt="" width={24} height={24} />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">Initial Assessment Form</p>
                      <p className="text-xs text-gray-500">PDF • Uploaded on April 15, 2025</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition">
                      <Image src="/download.png" alt="Download" width={20} height={20} />
                    </button>
                    <button className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition">
                      <Image src="/delete.png" alt="Delete" width={20} height={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;