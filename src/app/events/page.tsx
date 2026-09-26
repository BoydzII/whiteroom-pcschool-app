
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('wr_role') !== 'room') {
      router.push('/');
      return;
    }
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await fetch('/api/events?t=' + Date.now());
    const data = await res.json();
    if (data.success) setEvents(data.events);
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center">กำลังโหลด...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-red-900">เลือกกิจกรรมที่ต้องการลงชื่อ</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map(ev => (
          <Link key={ev.eventId} href={`/events/${ev.eventId}`} className="block bg-white p-6 rounded-3xl shadow-xl border-2 border-red-200 hover:shadow-md transition">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{ev.eventName}</h2>
            <div className="text-gray-500 text-sm">วันที่จัด: {ev.date}</div>
            <div className="mt-4 bg-red-50 text-red-800 text-center py-2 rounded-lg font-bold">
              คลิกเพื่อเช็คชื่อเข้ากิจกรรม
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
