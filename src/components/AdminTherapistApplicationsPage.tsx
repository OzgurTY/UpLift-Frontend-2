'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface TherapistApplication {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  age?: number;
  gender?: string;
  specialization: string[];
  languages?: string[];
  location?: {
    city: string;
    country: string;
  };
  licenseNumber: string;
  description?: string;
  certificateUrl?: string;
  createdAt: string;
}

const AdminTherapistApplicationsPage = () => {
  const [applications, setApplications] = useState<TherapistApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApplication, setSelectedApplication] = useState<TherapistApplication | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  // Fetch therapist applications
  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      let endpoint = '/api/admin/therapists-pending';
      // In a real implementation, we would have different endpoints for different tabs
      // but for now we'll just filter the results on the frontend
      
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      let data = await response.json();
      
      // Filter applications based on active tab
      if (activeTab === 'pending') {
        data = data.filter((app: any) => !app.approved && !app.rejected);
      } else if (activeTab === 'approved') {
        data = data.filter((app: any) => app.approved);
      } else if (activeTab === 'rejected') {
        data = data.filter((app: any) => app.rejected);
      }
      
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  // Handle application approval
  const handleApprove = async (applicationId: string) => {
    try {
      setProcessingAction(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5001/api/admin/therapists-approve/${applicationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve application');
      }
      
      // Update the applications list
      setApplications(prev => prev.filter(app => app._id !== applicationId));
      setModalOpen(false);
      setSelectedApplication(null);
      
      // Refetch applications to get the updated list
      fetchApplications();
    } catch (err: any) {
      setError(err.message || 'Failed to approve application');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle application rejection
  const handleReject = async (applicationId: string) => {
    try {
      setProcessingAction(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5001/api/admin/therapists-reject/${applicationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject application');
      }
      
      // Update the applications list
      setApplications(prev => prev.filter(app => app._id !== applicationId));
      setModalOpen(false);
      setSelectedApplication(null);
      
      // Refetch applications to get the updated list
      fetchApplications();
    } catch (err: any) {
      setError(err.message || 'Failed to reject application');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle view application details
  const handleViewDetails = (application: TherapistApplication) => {
    setSelectedApplication(application);
    setModalOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Components for rendering tabs
  const renderTabs = () => (
    <div className="mb-6 border-b">
      <div className="flex space-x-8">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Pending Applications
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'approved'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Approved Applications
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'rejected'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Rejected Applications
        </button>
      </div>
    </div>
  );

  // Render application cards
  const renderApplicationCards = () => {
    if (loading) {
      return (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading applications...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    if (applications.length === 0) {
      return (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No {activeTab} applications found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applications.map((application) => (
          <div key={application._id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{application.user.username}</h3>
                <p className="text-sm text-gray-500">{application.user.email}</p>
                <p className="text-xs text-gray-400">
                  Applied on {formatDate(application.createdAt)}
                </p>
              </div>
              {application.certificateUrl && (
                <span className="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-1">
                  Certificate Attached
                </span>
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Specializations:</span>{' '}
                {application.specialization.join(', ')}
              </p>
              {application.location && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Location:</span>{' '}
                  {application.location.city}, {application.location.country}
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => handleViewDetails(application)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
              >
                View Details
              </button>
              {activeTab === 'pending' && (
                <>
                  <button
                    onClick={() => handleReject(application._id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(application._id)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render application detail modal
  const renderApplicationModal = () => {
    if (!selectedApplication || !modalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl overflow-auto max-h-[90vh]">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Therapist Application</h2>
            <button
              onClick={() => {
                setModalOpen(false);
                setSelectedApplication(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-semibold text-gray-600">
                    {selectedApplication.user.username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedApplication.user.username}
                  </h3>
                  <p className="text-gray-600">{selectedApplication.user.email}</p>
                  <p className="text-sm text-gray-500">
                    Applied on {formatDate(selectedApplication.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {selectedApplication.gender && (
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium capitalize">{selectedApplication.gender}</p>
                  </div>
                )}
                {selectedApplication.age && (
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium">{selectedApplication.age} years</p>
                  </div>
                )}
                {selectedApplication.location && (
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">
                      {selectedApplication.location.city}, {selectedApplication.location.country}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">License Number</p>
                  <p className="font-medium">{selectedApplication.licenseNumber}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.specialization.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {selectedApplication.languages && selectedApplication.languages.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.languages.map((lang, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedApplication.description && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Professional Description</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedApplication.description}
                  </p>
                </div>
              )}

              {selectedApplication.certificateUrl && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Certificate</p>
                  <div className="flex items-center bg-gray-50 p-3 rounded">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-blue-600">Certificate Document</span>
                    <a
                      href={`http://localhost:5001/uploads/${selectedApplication.certificateUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {activeTab === 'pending' && (
              <div className="flex justify-end space-x-3 border-t pt-4">
                <button
                  onClick={() => handleReject(selectedApplication._id)}
                  disabled={processingAction}
                  className={`px-4 py-2 bg-red-100 text-red-700 rounded-md ${
                    processingAction ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-200'
                  } transition`}
                >
                  {processingAction ? 'Processing...' : 'Reject Application'}
                </button>
                <button
                  onClick={() => handleApprove(selectedApplication._id)}
                  disabled={processingAction}
                  className={`px-4 py-2 bg-green-100 text-green-700 rounded-md ${
                    processingAction ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-200'
                  } transition`}
                >
                  {processingAction ? 'Processing...' : 'Approve Application'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 flex flex-col gap-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-2">Therapist Applications</h1>
        <p className="text-gray-600 mb-6">
          Review and manage applications from users who want to become therapists.
        </p>

        {/* Tabs */}
        {renderTabs()}

        {/* Application Cards */}
        {renderApplicationCards()}

        {/* Application Detail Modal */}
        {renderApplicationModal()}
      </div>
    </div>
  );
};

export default AdminTherapistApplicationsPage;