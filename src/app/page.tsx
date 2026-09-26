"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Users, Lock, LogIn, Key } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedRoom, setSelectedRoom] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('wr_role');
    if (role === 'admin') router.push('/admin');
    else if (role === 'room') router.push('/events');
    else fetchRooms();
  }, [router]);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms?t=' + Date.now());
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Admin Login Hardcoded (Super Admin)
    if (isAdminLogin) {
      if (password === '999999') { // Super Admin Pin
        localStorage.setItem('wr_role', 'admin');
        router.push('/admin');
      } else {
        alert('รหัสผ่านแอดมินไม่ถูกต้อง');
      }
      return;
    }

    // 2. Room Login
    if (!selectedRoom) return alert("กรุณาเลือกห้องเรียน");
    if (!password) return alert("กรุณากรอกรหัสผ่านห้อง");

    const room = rooms.find(r => String(r.roomName) === String(selectedRoom));
    if (!room) return alert("ไม่พบห้องเรียน");

    const p = String(password).trim();
    const joinPass = String(room.password || "1234").trim();

    if (p === joinPass) {
      localStorage.setItem('wr_role', 'room');
      localStorage.setItem('wr_roomName', room.roomName);
      localStorage.setItem('wr_advisor', room.advisorName || "");
      router.push('/events');
    } else {
      alert(`รหัสผ่านห้องไม่ถูกต้อง (ค่าเริ่มต้นคือ 1234)`);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="flex justify-center items-center gap-6 mb-4">
          <Image src="/school-logo.jpg" alt="ตราโรงเรียนปากช่อง" width={80} height={80} className="object-contain" />
          <Image src="/logo.png" alt="โลโก้ห้องเรียนสีขาว" width={90} height={90} className="object-contain" />
        </div>
        <h2 className="text-lg font-bold text-center text-gray-700 mb-1">โรงเรียนปากช่อง จังหวัดนครราชสีมา</h2>
        <h1 className="text-2xl font-bold text-center text-emerald-800 mb-2">ระบบลงชื่อกิจกรรม</h1>
        <p className="text-gray-500 text-center mb-8">โครงการห้องเรียนสีขาว</p>

        <form onSubmit={handleLogin} className="space-y-5">
          {!isAdminLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เลือกห้องเรียน</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                  required={!isAdminLogin}
                >
                  <option value="">-- เลือกห้องเรียน --</option>
                  {rooms.map((r, idx) => (
                    <option key={idx} value={r.roomName}>{r.roomName}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isAdminLogin ? "รหัสผ่านแอดมิน" : "รหัสผ่านเข้าห้อง (ค่าเริ่มต้น 1234)"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            <LogIn size={20} />
            {isAdminLogin ? "เข้าสู่ระบบ (แอดมิน)" : "เข้าสู่ห้องเรียน"}
          </button>
          
          <div className="pt-4 text-center border-t">
            <button 
              type="button" 
              onClick={() => setIsAdminLogin(!isAdminLogin)}
              className="text-gray-500 text-sm font-medium hover:text-emerald-600 flex items-center justify-center gap-1 mx-auto"
            >
              <Key size={16} />
              {isAdminLogin ? "กลับไปหน้าเข้าระบบห้องเรียน" : "เข้าสู่ระบบสำหรับแอดมินใหญ่"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

