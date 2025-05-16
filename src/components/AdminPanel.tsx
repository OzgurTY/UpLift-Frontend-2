'use client';

import React, { useState, useEffect } from 'react';
import AdminTherapistApplicationsPage from "./AdminTherapistApplicationsPage";
import { useRouter } from 'next/navigation';

const AdminPanel = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'therapist-applications' | 'users' | 'appointments'>('therapist-applications');

  // Check if the user is an admin
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch('http://localhost:5001/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUserRole(userData.role);

        // If not admin, redirect to home
        if (userData.role !== 'admin') {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null; // This will be handled by the redirect in useEffect
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md h-screen fixed">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
          </div>
          <nav className="mt-4">
            <ul>
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left px-4 py-2 ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('therapist-applications')}
                  className={`w-full text-left px-4 py-2 ${
                    activeTab === 'therapist-applications'
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Therapist Applications
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left px-4 py-2 ${
                    activeTab === 'users'
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  User Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`w-full text-left px-4 py-2 ${
                    activeTab === 'appointments'
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Appointments
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Total Users</h2>
                  <p className="text-3xl font-bold text-blue-600">142</p>
                  <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Active Therapists</h2>
                  <p className="text-3xl font-bold text-blue-600">38</p>
                  <p className="text-sm text-gray-500 mt-1">+5% from last month</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Pending Applications</h2>
                  <p className="text-3xl font-bold text-blue-600">7</p>
                  <p className="text-sm text-gray-500 mt-1">Needs your review</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'therapist-applications' && <AdminTherapistApplicationsPage />}

          {activeTab === 'users' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">User Management</h1>
              <p>User management interface will be implemented here.</p>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Appointments</h1>
              <p>Appointment management interface will be implemented here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;