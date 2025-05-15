'use client';

import React, { useState } from 'react';

const AddGoalModal = ({ onClose }: { onClose: () => void }) => {
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleAddGoal = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/progress/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ description }),
      });

      if (!res.ok) {
        throw new Error('Failed to add goal');
      }

      onClose();
    } catch (error) {
      setError('Error adding goal');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-96">
        <h2 className="text-lg font-semibold mb-4">Add New Goal</h2>
        
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          placeholder="Goal description"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
          <button onClick={handleAddGoal} className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
        </div>
      </div>
    </div>
  );
};

export default AddGoalModal;
