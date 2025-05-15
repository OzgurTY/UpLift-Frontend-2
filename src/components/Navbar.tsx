'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface User {
  name: string;
  role: string;
}

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data: User = await response.json();
        setUser(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex items-center justify-between p-4">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>

      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        <div className="bg-white rounded-full w-7 h-7 items-center justify-center flex cursor-pointer">
          <Image src="/message.png" alt="" width={24} height={24} />
        </div>
        <div className="bg-white rounded-full w-7 h-7 items-center justify-center flex cursor-pointer relative">
          <Image src="/announcement.png" alt="" width={24} height={24} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1
          </div>
        </div>

        {/* Displaying user information */}
        <div className="flex flex-col">
          {loading ? (
            <span>Loading...</span> // Or any fallback text you'd prefer
          ) : error ? (
            <span>{error}</span>
          ) : (
            <>
              <span className="text-xs leading-3 font-medium">{user?.name}</span>
              <span className="text-[10px] text-gray-500 text-right">{user?.role}</span>
            </>
          )}
        </div>

        <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full" />
      </div>
    </div>
  );
};

export default Navbar;
