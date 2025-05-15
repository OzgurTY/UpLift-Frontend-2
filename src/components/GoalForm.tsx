'use client';

import React, { useEffect, useState } from 'react';
import AddGoalModal from './AddGoalModal';

interface Goal {
  _id: string;
  description: string;
  progress: number;
  completed: boolean;
}

const GoalsSection = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/progress', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setGoals(data.goals || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5001/api/progress/goal/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ progressValue: newProgress }),
      });
      fetchGoals();
    } catch (error) {
      console.error('Update goal error:', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Therapy Goals</h2>
        <button onClick={() => setShowModal(true)} className="text-blue-600 text-sm">
          + Add New Goal
        </button>
      </div>

      {goals.length > 0 ? (
        goals.map((goal) => (
          <div key={goal._id} className={`p-4 border rounded-lg mb-2 ${goal.completed ? 'bg-green-50' : ''}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className={`font-medium ${goal.completed ? 'text-green-700' : 'text-gray-800'}`}>{goal.description}</p>
                {!goal.completed && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${goal.progress}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-600">{goal.progress}%</span>
                  </div>
                )}
              </div>
              {!goal.completed && (
                <button
                  className="text-blue-600 text-sm"
                  onClick={() => updateGoalProgress(goal._id, Math.min(goal.progress + 10, 100))}
                >
                  Update
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No goals set yet.</p>
      )}

      {showModal && <AddGoalModal onClose={() => { setShowModal(false); fetchGoals(); }} />}
    </div>
  );
};

export default GoalsSection;
