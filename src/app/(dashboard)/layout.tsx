'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import SessionRatingPrompt from "@/components/SessionRatingPrompt";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserId(userData.id);
        setUserRole(userData.role);
      } catch (err) {
        console.error('Failed to parse user data:', err);
      }
    }
  }, []);

  return (
    <div className="h-screen flex">
      {/* LEFT */}
      <div className="w-[14%] md:w[8%] lg:w-[16%] xl:w-[14%] p-4">
        <Link href="/" className="flex items-center justify-start gap-2 mb-4">
          <Image src="/textLogo.png" alt="logo" width={128} height={32}></Image>
        </Link>
        <Menu/>
      </div>
      {/* RIGHT */}
      <div className="w-[86%] md:w[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
        <Navbar />
        {children}
        
        {/* Show rating prompt only for patients */}
        {userId && userRole === 'patient' && (
          <SessionRatingPrompt userId={userId} />
        )}
      </div>
    </div>
  )
}