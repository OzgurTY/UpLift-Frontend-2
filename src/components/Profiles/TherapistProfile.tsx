'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useRouter } from 'next/navigation';

interface TherapistData {
  id: string;
  username: string;
  email: string;
  phone?: string;
  description?: string;
  location?: {
    city: string;
    country: string;
  };
  specialization: string[];
  languages?: string[];
  licenseNumber?: string;
  education?: {
    institution: string;
    degree: string;
    field: string;
    year: number;
  }[];
  experience?: {
    position: string;
    organization: string;
    startYear: number;
    endYear?: number;
    current?: boolean;
  }[];
  availability?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  certifications?: {
    name: string;
    issuedBy: string;
    year: number;
    expiryYear?: number;
  }[];
  ratingAverage?: number;
  ratingCount?: number;
  sessionPrice?: number;
  createdAt?: string;
}

interface Review {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
}

interface SessionData {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

interface PerformanceData {
  sessionsCompleted: number;
  patientCount: number;
  occupancyRate: number;
  ratings: {
    date: string;
    rating: number;
  }[];
  weeklyStats: {
    week: string;
    sessions: number;
    newPatients: number;
  }[];
}

const TherapistProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const router = useRouter();
  const [therapist, setTherapist] = useState<TherapistData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'performance' | 'documents'>('overview');

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

        // Fetch therapist profile data
        const profileResponse = await fetch(`http://localhost:5001/api/therapists/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const profileData = await profileResponse.json();
        setTherapist(profileData);

        // Mock reviews data
        const mockReviews: Review[] = [
          {
            id: '1',
            patientName: 'Sarah J.',
            rating: 5,
            comment: 'Dr. Johnson has been incredibly helpful in my journey. Her approach is compassionate and effective.',
            date: '2025-05-01'
          },
          {
            id: '2',
            patientName: 'Mark T.',
            rating: 4,
            comment: 'Very professional and knowledgeable. Has helped me develop effective coping strategies.',
            date: '2025-04-22'
          },
          {
            id: '3',
            patientName: 'Lisa R.',
            rating: 5,
            comment: 'I appreciate the personalized care and attention to detail. Highly recommended!',
            date: '2025-04-10'
          },
          {
            id: '4',
            patientName: 'James K.',
            rating: 4,
            comment: 'Great therapist who listens well and provides practical advice.',
            date: '2025-03-28'
          }
        ];
        setReviews(mockReviews);

        // Mock sessions data
        const mockSessions: SessionData[] = [
          {
            id: '1',
            patientName: 'Jennifer Adams',
            patientId: 'p123',
            date: '2025-05-20',
            time: '10:00 AM - 11:00 AM',
            type: 'Virtual Session',
            status: 'upcoming'
          },
          {
            id: '2',
            patientName: 'Michael Thompson',
            patientId: 'p456',
            date: '2025-05-20',
            time: '2:00 PM - 3:00 PM',
            type: 'In-person Session',
            status: 'upcoming'
          },
          {
            id: '3',
            patientName: 'Rebecca Liu',
            patientId: 'p789',
            date: '2025-05-15',
            time: '11:30 AM - 12:30 PM',
            type: 'Virtual Session',
            status: 'completed',
            notes: 'Discussed anxiety management techniques and homework for the week'
          },
          {
            id: '4',
            patientName: 'David Wilson',
            patientId: 'p101',
            date: '2025-05-14',
            time: '3:00 PM - 4:00 PM',
            type: 'In-person Session',
            status: 'completed',
            notes: 'Follow-up on medication effects and sleep improvement'
          },
          {
            id: '5',
            patientName: 'Sofia Garcia',
            patientId: 'p202',
            date: '2025-05-10',
            time: '9:00 AM - 10:00 AM',
            type: 'Virtual Session',
            status: 'completed',
            notes: 'Initial assessment completed, treatment plan discussed'
          }
        ];
        setSessions(mockSessions);

        // Mock performance data
        const mockPerformance: PerformanceData = {
          sessionsCompleted: 125,
          patientCount: 28,
          occupancyRate: 85,
          ratings: [
            { date: '2025-01', rating: 4.5 },
            { date: '2025-02', rating: 4.6 },
            { date: '2025-03', rating: 4.7 },
            { date: '2025-04', rating: 4.8 },
            { date: '2025-05', rating: 4.9 }
          ],
          weeklyStats: [
            { week: 'Apr 14-20', sessions: 15, newPatients: 2 },
            { week: 'Apr 21-27', sessions: 18, newPatients: 3 },
            { week: 'Apr 28-May 4', sessions: 17, newPatients: 1 },
            { week: 'May 5-11', sessions: 20, newPatients: 4 },
            { week: 'May 12-18', sessions: 19, newPatients: 2 }
          ]
        };
        setPerformanceData(mockPerformance);

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

  if (error || !therapist) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Unavailable</h2>
          <p className="text-gray-600 mb-4">{error || 'Therapist profile could not be loaded'}</p>
          <Link href="/therapist" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Sort sessions by date
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const upcomingSessions = sortedSessions.filter(session => session.status === 'upcoming');
  const pastSessions = sortedSessions.filter(session => session.status === 'completed');

  // Calculate average rating from reviews
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  
  // Create rating distribution data
  const ratingDistribution = Array(5).fill(0);
  reviews.forEach(review => ratingDistribution[review.rating - 1]++);
  
  const ratingDistributionData = ratingDistribution.map((count, index) => ({
    rating: 5 - index,
    count,
    percentage: (count / reviews.length) * 100
  }));

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
                  alt={therapist.username} 
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
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{therapist.username}</h1>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star} 
                          className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-sm text-gray-600">{averageRating.toFixed(1)} ({reviews.length} reviews)</span>
                  </div>
                </div>
                {isCurrentUser && (
                  <div>
                    <Link 
                      href="/settings" 
                      className="inline-flex items-center text-blue-600 text-sm font-medium mt-2 md:mt-0"
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
              
              <p className="text-gray-600 mb-4">{therapist.description || 'No bio provided yet.'}</p>
              
              <div className="flex flex-wrap gap-4 mb-4">
                {therapist.specialization?.map((spec, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {spec}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <Image src="/mail.png" alt="" width={16} height={16} />
                  </div>
                  <span className="text-gray-700">{therapist.email}</span>
                </div>
                
                {therapist.phone && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                      <Image src="/phone.png" alt="" width={16} height={16} />
                    </div>
                    <span className="text-gray-700">{therapist.phone}</span>
                  </div>
                )}
                
                {therapist.location && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                      <Image src="/location.png" alt="" width={16} height={16} />
                    </div>
                    <span className="text-gray-700">
                      {therapist.location.city}, {therapist.location.country}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {!isCurrentUser && (
              <div className="mt-4 md:mt-0 flex flex-col items-center">
                <p className="text-xl font-bold text-gray-800 mb-1">
                  {therapist.sessionPrice ? `$${therapist.sessionPrice}` : '$75'}<span className="text-sm text-gray-500">/session</span>
                </p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition mb-2">
                  Book a Session
                </button>
                <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition">
                  Contact
                </button>
              </div>
            )}
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
              Sessions
            </button>
            {isCurrentUser && (
              <button 
                onClick={() => setActiveTab('performance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'performance' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Performance
              </button>
            )}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* About Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">About</h2>
                  <p className="text-gray-700 mb-4">
                    {therapist.description || 
                    `A dedicated and compassionate therapist with a focus on providing personalized care. 
                    Specializes in ${therapist.specialization.join(', ')} and committed to helping clients 
                    achieve their wellness goals through evidence-based approaches and a supportive therapeutic relationship.`}
                  </p>
                  
                  {therapist.languages && therapist.languages.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-md font-medium text-gray-800 mb-2">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {therapist.languages.map((language, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Education & Certifications */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-medium text-gray-800">Education & Certifications</h2>
                    {isCurrentUser && (
                      <button className="text-blue-600 text-sm font-medium">
                        + Add
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {/* Education */}
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-3">Education</h3>
                      {therapist.education && therapist.education.length > 0 ? (
                        <div className="space-y-4">
                          {therapist.education.map((edu, idx) => (
                            <div key={idx} className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                                <Image src="/education.png" alt="" width={16} height={16} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{edu.degree} in {edu.field}</p>
                                <p className="text-sm text-gray-600">{edu.institution}</p>
                                <p className="text-sm text-gray-500">{edu.year}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                            <Image src="/education.png" alt="" width={16} height={16} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Ph.D. in Clinical Psychology</p>
                            <p className="text-sm text-gray-600">University of California, Berkeley</p>
                            <p className="text-sm text-gray-500">2018</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Certifications */}
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-3">Certifications</h3>
                      {therapist.certifications && therapist.certifications.length > 0 ? (
                        <div className="space-y-4">
                          {therapist.certifications.map((cert, idx) => (
                            <div key={idx} className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                                <Image src="/certificate.png" alt="" width={16} height={16} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{cert.name}</p>
                                <p className="text-sm text-gray-600">{cert.issuedBy}</p>
                                <p className="text-sm text-gray-500">{cert.year}{cert.expiryYear ? ` - ${cert.expiryYear}` : ''}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                            <Image src="/certificate.png" alt="" width={16} height={16} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Licensed Clinical Psychologist</p>
                            <p className="text-sm text-gray-600">American Board of Professional Psychology</p>
                            <p className="text-sm text-gray-500">2019 - 2027</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Experience */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-medium text-gray-800">Professional Experience</h2>
                    {isCurrentUser && (
                      <button className="text-blue-600 text-sm font-medium">
                        + Add
                      </button>
                    )}
                  </div>
                  
                  {therapist.experience && therapist.experience.length > 0 ? (
                    <div className="space-y-6">
                      {therapist.experience.map((exp, idx) => (
                        <div key={idx} className="relative pl-8 pb-6 before:absolute before:left-3 before:top-1 before:h-full before:w-0.5 before:bg-gray-200 last:pb-0 last:before:hidden">
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{exp.position}</p>
                            <p className="text-sm text-gray-600">{exp.organization}</p>
                            <p className="text-sm text-gray-500">
                              {exp.startYear} - {exp.current ? 'Present' : exp.endYear}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="relative pl-8 pb-6 before:absolute before:left-3 before:top-1 before:h-full before:w-0.5 before:bg-gray-200">
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Clinical Psychologist</p>
                          <p className="text-sm text-gray-600">Uplift Therapy Center</p>
                          <p className="text-sm text-gray-500">2020 - Present</p>
                        </div>
                      </div>
                      
                      <div className="relative pl-8 pb-6 before:absolute before:left-3 before:top-1 before:h-full before:w-0.5 before:bg-gray-200">
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Research Associate</p>
                          <p className="text-sm text-gray-600">University of California Medical Center</p>
                          <p className="text-sm text-gray-500">2018 - 2020</p>
                        </div>
                      </div>
                      
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Clinical Intern</p>
                          <p className="text-sm text-gray-600">San Francisco General Hospital</p>
                          <p className="text-sm text-gray-500">2016 - 2018</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Sidebar Column */}
              <div className="space-y-6">
                {/* Availability Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Availability</h2>
                  
                  {therapist.availability && therapist.availability.length > 0 ? (
                    <div className="space-y-3">
                      {therapist.availability.map((avail, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">{avail.day}</span>
                          <span className="text-gray-600">{avail.startTime} - {avail.endTime}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Monday</span>
                        <span className="text-gray-600">9:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Tuesday</span>
                        <span className="text-gray-600">9:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Wednesday</span>
                        <span className="text-gray-600">9:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Thursday</span>
                        <span className="text-gray-600">9:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Friday</span>
                        <span className="text-gray-600">9:00 AM - 3:00 PM</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                      Check Availability
                    </button>
                  </div>
                </div>
                
                {/* Reviews Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-800">Client Reviews</h2>
                    <Link href={`/therapists/${userId}/reviews`} className="text-blue-600 text-sm">
                      View All
                    </Link>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <div className="text-3xl font-bold text-gray-800 mr-2">{averageRating.toFixed(1)}</div>
                      <div>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                              key={star} 
                              className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">{reviews.length} reviews</p>
                      </div>
                    </div>
                    
                    {/* Rating Bars */}
                    <div className="space-y-2">
                      {ratingDistributionData.map((item) => (
                        <div key={item.rating} className="flex items-center">
                          <span className="w-6 text-xs text-gray-600">{item.rating}</span>
                          <div className="w-full bg-gray-200 rounded-full h-2 mx-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <span className="w-6 text-xs text-gray-600">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Review Samples */}
                  <div className="space-y-4">
                    {reviews.slice(0, 2).map((review) => (
                      <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-800">{review.patientName}</p>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg 
                                key={star} 
                                className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20" 
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{new Date(review.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-800">Sessions Schedule</h2>
                {isCurrentUser && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                    Add Availability
                  </button>
                )}
              </div>

              {/* Upcoming Sessions */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Upcoming Sessions</h3>
                
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map(session => (
                      <div key={session.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex items-start gap-4 mb-3 md:mb-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Image src="/calendar.png" alt="" width={24} height={24} />
                            </div>
                            <div>
                              {isCurrentUser ? (
                                <h4 className="font-medium text-gray-800">{session.patientName}</h4>
                              ) : (
                                <h4 className="font-medium text-gray-800">{therapist.username}</h4>
                              )}
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
                              {isCurrentUser && (
                                <button className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition">
                                  <Image src="/cancel.png" alt="Cancel" width={20} height={20} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No upcoming sessions scheduled</p>
                    {!isCurrentUser && (
                      <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                        Book a Session
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Past Sessions */}
              {isCurrentUser && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Past Sessions</h3>
                  
                  {pastSessions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Patient
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
                                <div className="text-sm font-medium text-gray-900">{session.patientName}</div>
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
              )}
            </div>
          )}

          {/* Performance Tab (Only visible to the therapist) */}
          {activeTab === 'performance' && isCurrentUser && performanceData && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <Image src="/calendar-check.png" alt="" width={28} height={28} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Sessions Completed</p>
                      <p className="text-3xl font-bold text-gray-800">{performanceData.sessionsCompleted}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                      <Image src="/users.png" alt="" width={28} height={28} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Active Clients</p>
                      <p className="text-3xl font-bold text-gray-800">{performanceData.patientCount}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Image src="/rating.png" alt="" width={28} height={28} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Occupancy Rate</p>
                      <p className="text-3xl font-bold text-gray-800">{performanceData.occupancyRate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rating Trend Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Rating Trend</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={performanceData.ratings}
                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="rating" stroke="#C3EBFA" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Weekly Sessions Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Weekly Performance</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={performanceData.weeklyStats}
                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sessions" name="Sessions" fill="#CFCEFF" />
                        <Bar dataKey="newPatients" name="New Clients" fill="#FAE27C" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Analytics Tools */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium text-gray-800">Analytics Dashboard</h2>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm hover:bg-gray-200 transition">
                      Weekly
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
                      Monthly
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm hover:bg-gray-200 transition">
                      Yearly
                    </button>
                  </div>
                </div>
                
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Advanced analytics dashboard will be available here</p>
                  <p className="text-sm text-gray-400 mt-2">Coming soon</p>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-800">Resource Documents</h2>
                {isCurrentUser && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                    Upload Document
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Image src="/pdf.png" alt="" width={24} height={24} />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">Cognitive Behavioral Therapy Guide</p>
                      <p className="text-xs text-gray-500">PDF • Uploaded on May 12, 2025</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition">
                      <Image src="/download.png" alt="Download" width={20} height={20} />
                    </button>
                    {isCurrentUser && (
                      <button className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition">
                        <Image src="/delete.png" alt="Delete" width={20} height={20} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Image src="/doc.png" alt="" width={24} height={24} />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">Stress Management Techniques</p>
                      <p className="text-xs text-gray-500">DOCX • Uploaded on April 28, 2025</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition">
                      <Image src="/download.png" alt="Download" width={20} height={20} />
                    </button>
                    {isCurrentUser && (
                      <button className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition">
                        <Image src="/delete.png" alt="Delete" width={20} height={20} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Image src="/ppt.png" alt="" width={24} height={24} />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">Mindfulness Meditation Slides</p>
                      <p className="text-xs text-gray-500">PPTX • Uploaded on April 15, 2025</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition">
                      <Image src="/download.png" alt="Download" width={20} height={20} />
                    </button>
                    {isCurrentUser && (
                      <button className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition">
                        <Image src="/delete.png" alt="Delete" width={20} height={20} />
                      </button>
                    )}
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

export default TherapistProfile;