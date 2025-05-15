'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import HomeNavbar from '@/components/HomeNavbar';

const RegisterPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      router.push('/auth/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse: any) => {
    try {
      const credential = credentialResponse.credential;

      const response = await fetch('http://localhost:5001/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google signup failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push(`/patient/${data.user.id}`);
    } catch (err: any) {
      console.error('Google Signup error:', err);
      setError(err.message || 'Google signup failed.');
    }
  };

  const handleGoogleError = () => {
    setError('Google signup failed. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <HomeNavbar />
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">Create an Account</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleRegister}>
          <div>
            <label className="block mb-2 text-sm text-gray-600">Full Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-600">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Create a password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-lg transition flex items-center justify-center`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        {/* Google Signup */}
        <div className="mt-6 text-center">
          <GoogleLogin
            onSuccess={handleGoogleSignup}
            onError={handleGoogleError}
          />
        </div>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
        <div className="mt-6 text-center">
          <Link href="/">
            <button className="text-blue-600 hover:underline">
              ← Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
