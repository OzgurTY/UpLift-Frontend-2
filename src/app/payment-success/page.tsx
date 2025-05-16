'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const slotId = params.get('slotId');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Confirming your payment...');

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId || !slotId) {
        setMessage('Invalid session data.');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId, slotId }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to confirm.');
        }

        const data = await res.json();
        setMessage('🎉 Payment confirmed and appointment booked!');
      } catch (error: any) {
        console.error(error);
        setMessage('❌ Payment succeeded but confirmation failed.');
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [sessionId, slotId]);

  return (
    <div className="p-10 flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold mb-4">Payment Success</h1>
      <p className="text-lg">{message}</p>
      {loading && <p className="text-sm text-gray-500 mt-2">Please wait...</p>}
    </div>
  );
}
