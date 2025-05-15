'use client';

import React, { useState } from 'react';

const MoodForm = () => {
  const [mood, setMood] = useState('');
  const [intensity, setIntensity] = useState<number>(5);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const moodOptions = [
    'Happy',
    'Sad',
    'Anxious',
    'Tired',
    'Angry',
    'Content',
    'Frustrated',
    'Motivated'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/progress/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          mood,
          intensity
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save mood');
      }

      setSuccessMessage('Mood saved successfully!');
      setMood('');
      setIntensity(5);
    } catch (error) {
      setErrorMessage('Error saving mood');
      console.error(error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold mb-4">Track Your Mood</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select your mood</option>
            {moodOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Intensity</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={intensity} 
            onChange={(e) => setIntensity(Number(e.target.value))} 
            className="w-full"
          />
          <p className="text-sm text-gray-500 text-center">{intensity}/10</p>
        </div>

        {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}
        {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}

        <button 
          type="submit" 
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Save Mood
        </button>
      </form>
    </div>
  );
};

export default MoodForm;
