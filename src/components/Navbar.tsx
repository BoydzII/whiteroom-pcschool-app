"use client";
import Link from 'next/link';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [role, setRole] = useState("");
  const [room, setRoom] = useState("");
  
  useEffect(() => {
    setRole(localStorage.getItem('wr_role') || "");
    setRoom(localStorage.getItem('wr_roomName') || "");
  }, []);

  return (
    <nav className="bg-gradient-to-r from-red-700 to-red-900 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-lg flex items-center gap-2">
          <ShieldCheck size={24} />
          <span className="hidden sm:inline">ห้องเรียนสีขาว (White Classroom)</span>
          <span className="sm:hidden">ห้องเรียนสีขาว</span>
        </Link>
        <div className="flex items-center gap-4">
          {role === 'admin' && <span className="font-medium bg-red-950 px-3 py-1 rounded-lg">แอดมิน</span>}
          {role === 'room' && <span className="font-medium bg-red-950 px-3 py-1 rounded-lg">ห้อง {room}</span>}
          
          {role && (
            <button 
              onClick={() => {
                localStorage.removeItem('wr_role');
                localStorage.removeItem('wr_roomName');
                localStorage.removeItem('wr_advisor');
                window.location.href = '/';
              }}
              className="flex items-center gap-1 hover:text-red-200"
            >
              <LogOut size={20} />
              <span>ออกระบบ</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
