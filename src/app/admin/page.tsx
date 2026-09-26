
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  
  // New Event State
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [hasExtraField, setHasExtraField] = useState(false);
  const [extraFieldLabel, setExtraFieldLabel] = useState('');
  const [hasAttachment, setHasAttachment] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('wr_role') !== 'admin') {
      router.push('/');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    const resE = await fetch('/api/events');
    const dataE = await resE.json();
    if(dataE.success) setEvents(dataE.events);

    const resR = await fetch('/api/rooms');
    const dataR = await resR.json();
    if(dataR.success) setRooms(dataR.rooms);

    const resA = await fetch('/api/attendance');
    const dataA = await resA.json();
    if(dataA.success) setAttendance(dataA.attendance);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify({ eventName, date: eventDate, hasExtraField, extraFieldLabel, hasAttachment })
    });
    const data = await res.json();
    setLoading(false);
    if(data.success) {
      alert("สร้างกิจกรรมสำเร็จ!");
      setEventName('');
      setEventDate('');
      setHasExtraField(false);
      setExtraFieldLabel('');
      setHasAttachment(false);
      fetchData();
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-emerald-800">แอดมิน: แดชบอร์ดห้องเรียนสีขาว</h1>
      
      <div className="flex gap-2 mb-6">
        <button onClick={()=>setActiveTab('events')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'events' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}>จัดการกิจกรรม</button>
        <button onClick={()=>setActiveTab('reports')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'reports' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}>ดูรายงาน 84 ห้อง</button>
      </div>

      {activeTab === 'events' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow border">
            <h2 className="text-xl font-bold mb-4">สร้างกิจกรรมใหม่</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">ชื่อกิจกรรม (เช่น วันพ่อ, วันแม่)</label>
                <input type="text" value={eventName} onChange={e=>setEventName(e.target.value)} required className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">วันที่จัดกิจกรรม</label>
                <input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} required className="w-full border p-2 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={hasExtraField} onChange={e=>setHasExtraField(e.target.checked)} />
                <label>ต้องการช่องกรอกข้อมูลพิเศษ (เช่น ชื่อผู้ปกครองดีเด่น)</label>
              </div>
              {hasExtraField && (
                <div>
                  <label className="block text-sm font-medium">หัวข้อช่องกรอกพิเศษ</label>
                  <input type="text" value={extraFieldLabel} onChange={e=>setExtraFieldLabel(e.target.value)} required className="w-full border p-2 rounded" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={hasAttachment} onChange={e=>setHasAttachment(e.target.checked)} />
                <label>ต้องการให้อัปโหลดหลักฐานรูปภาพ</label>
              </div>
              <button disabled={loading} className="w-full bg-emerald-600 text-white py-2 rounded font-bold">{loading ? "กำลังสร้าง..." : "บันทึกกิจกรรม"}</button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border overflow-auto max-h-96">
            <h2 className="text-xl font-bold mb-4">รายการกิจกรรมทั้งหมด</h2>
            {events.map((ev, i) => (
              <div key={i} className="border-b p-2">
                <div className="font-bold">{ev.eventName}</div>
                <div className="text-sm text-gray-500">วันที่: {ev.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-bold mb-4">สถานะการส่งชื่อแต่ละห้อง</h2>
          {events.map(ev => {
            const evAtt = attendance.filter(a => a.eventId === ev.eventId);
            return (
              <div key={ev.eventId} className="mb-8 border p-4 rounded">
                <h3 className="text-lg font-bold bg-gray-100 p-2 mb-4">{ev.eventName} (ส่งแล้ว {evAtt.length} / 84 ห้อง)</h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {rooms.map(room => {
                    const submitted = evAtt.find(a => String(a.roomName).trim() === String(room.roomName).trim());
                    return (
                      <div key={room.roomName} className={`p-2 border rounded text-center text-sm font-bold ${submitted ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : 'bg-red-50 border-red-300 text-red-600'}`}>
                        {room.roomName}
                        {submitted ? <CheckCircle size={16} className="mx-auto mt-1" /> : <XCircle size={16} className="mx-auto mt-1" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
