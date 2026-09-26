
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CheckCircle, XCircle, Search } from 'lucide-react';

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

  // Search Filters
  const [searchEvent, setSearchEvent] = useState('');
  const [searchRoom, setSearchRoom] = useState('');

  useEffect(() => {
    if (localStorage.getItem('wr_role') !== 'admin') {
      router.push('/');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    const resE = await fetch('/api/events?t=' + Date.now());
    const dataE = await resE.json();
    if(dataE.success) setEvents(dataE.events);

    const resR = await fetch('/api/rooms?t=' + Date.now());
    const dataR = await resR.json();
    if(dataR.success) setRooms(dataR.rooms);

    const resA = await fetch('/api/attendance?t=' + Date.now());
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

  const filteredEvents = events.filter(ev => String(ev.eventName).toLowerCase().includes(searchEvent.toLowerCase()));
  const filteredRooms = rooms.filter(rm => String(rm.roomName).toLowerCase().includes(searchRoom.toLowerCase()));

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-emerald-800">แอดมิน: แดชบอร์ดห้องเรียนสีขาว</h1>
      
      <div className="flex gap-2 mb-6">
        <button onClick={()=>setActiveTab('events')} className={`px-6 py-3 rounded-full font-bold shadow-md transition ${activeTab === 'events' ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>จัดการกิจกรรม</button>
        <button onClick={()=>setActiveTab('reports')} className={`px-6 py-3 rounded-full font-bold shadow-md transition ${activeTab === 'reports' ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>ดูรายงานการส่ง</button>
      </div>

      {activeTab === 'events' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-emerald-200">
            <h2 className="text-xl font-bold mb-4 text-emerald-800">สร้างกิจกรรมใหม่</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อกิจกรรม (เช่น วันพ่อ, วันแม่)</label>
                <input type="text" value={eventName} onChange={e=>setEventName(e.target.value)} required className="w-full border-2 border-emerald-100 p-3 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">วันที่จัดกิจกรรม</label>
                <input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} required className="w-full border-2 border-emerald-100 p-3 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none" />
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 p-3 rounded-2xl border-2 border-emerald-100">
                <input type="checkbox" checked={hasExtraField} onChange={e=>setHasExtraField(e.target.checked)} className="w-5 h-5 text-emerald-600" />
                <label className="font-bold text-sm text-emerald-900">ต้องการช่องกรอกข้อมูลพิเศษ (เช่น ชื่อผู้ปกครองดีเด่น)</label>
              </div>
              {hasExtraField && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">หัวข้อช่องกรอกพิเศษ</label>
                  <input type="text" value={extraFieldLabel} onChange={e=>setExtraFieldLabel(e.target.value)} required className="w-full border-2 border-emerald-100 p-3 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none" />
                </div>
              )}
              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-2xl border-2 border-blue-100">
                <input type="checkbox" checked={hasAttachment} onChange={e=>setHasAttachment(e.target.checked)} className="w-5 h-5 text-blue-600" />
                <label className="font-bold text-sm text-blue-900">ต้องการให้อัปโหลดหลักฐานรูปภาพ</label>
              </div>
              <button disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-3xl font-bold shadow-lg hover:bg-emerald-700 transition">{loading ? "กำลังสร้าง..." : "บันทึกกิจกรรม"}</button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-emerald-200 overflow-auto max-h-[36rem]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-emerald-800">รายการกิจกรรมทั้งหมด</h2>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="ค้นหากิจกรรม..." value={searchEvent} onChange={e=>setSearchEvent(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none" />
            </div>

            <div className="space-y-3">
              {filteredEvents.map((ev, i) => (
                <div key={i} className="border-2 border-emerald-100 bg-emerald-50/50 p-4 rounded-2xl">
                  <div className="font-bold text-lg text-emerald-900">{ev.eventName}</div>
                  <div className="text-sm text-gray-600 font-medium">วันที่: {ev.date}</div>
                </div>
              ))}
              {filteredEvents.length === 0 && <div className="text-center text-gray-500 py-4">ไม่พบข้อมูลกิจกรรม</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-emerald-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-emerald-800">สถานะการส่งชื่อแต่ละห้อง</h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="ค้นหาชื่อห้อง..." value={searchRoom} onChange={e=>setSearchRoom(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none" />
            </div>
          </div>

          <div className="space-y-8">
            {events.map(ev => {
              const evAtt = attendance.filter(a => a.eventId === ev.eventId);
              return (
                <div key={ev.eventId} className="border-2 border-emerald-200 bg-emerald-50/30 p-6 rounded-3xl shadow-sm">
                  <h3 className="text-xl font-bold bg-white border-2 border-emerald-200 text-emerald-800 p-3 rounded-2xl mb-6 shadow-sm inline-block">
                    {ev.eventName} (ส่งแล้ว {evAtt.length} / {rooms.length} ห้อง)
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {filteredRooms.map(room => {
                      const submitted = evAtt.find(a => String(a.roomName).trim() === String(room.roomName).trim());
                      return (
                        <div key={room.roomName} className={`p-3 border-2 rounded-2xl text-center shadow-sm flex flex-col items-center justify-center h-24 ${submitted ? 'bg-emerald-100 border-emerald-400 text-emerald-900' : 'bg-red-50 border-red-200 text-red-600'}`}>
                          <span className="font-bold text-lg">{room.roomName}</span>
                          {submitted ? <CheckCircle size={24} className="mt-2 text-emerald-600" /> : <XCircle size={24} className="mt-2 text-red-400 opacity-50" />}
                        </div>
                      )
                    })}
                  </div>
                  {filteredRooms.length === 0 && <div className="text-center text-gray-500">ไม่พบห้องเรียนที่ค้นหา</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
