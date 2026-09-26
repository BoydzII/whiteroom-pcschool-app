
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Plus, CheckCircle, XCircle, Search } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  
  // New Event State
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [hasExtraField, setHasExtraField] = useState(false);
  const [extraFieldLabel, setExtraFieldLabel] = useState('');
  const [hasAttachment, setHasAttachment] = useState(false);
  const [loading, setLoading] = useState(false);


  // Excel Upload State
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [excelStatus, setExcelStatus] = useState('');

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

    const resS = await fetch('/api/students?t=' + Date.now());
    const dataS = await resS.json();
    if(dataS.success) setAllStudents(dataS.students);

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


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingExcel(true);
    setExcelStatus('กำลังอ่านไฟล์ Excel...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        // Ensure we skip headers and take rows
        const studentRows = data.filter(row => row.length >= 4 && row[0] !== 'roomName');
        
        if (studentRows.length === 0) {
          alert('ไม่พบข้อมูล หรือรูปแบบคอลัมน์ไม่ถูกต้อง (ต้องมี roomName, studentId, number, fullName)');
          setUploadingExcel(false);
          setExcelStatus('');
          return;
        }

        setExcelStatus(`กำลังอัปโหลดนักเรียน ${studentRows.length} คน ไปยังฐานข้อมูล... (อาจใช้เวลา 5-10 วินาที)`);
        
        const res = await fetch('/api/students', {
          method: 'POST',
          body: JSON.stringify({ students: studentRows })
        });
        const result = await res.json();
        
        if (result.success) {
          alert(`อัปโหลดรายชื่อสำเร็จ ${result.count} คน!`);
          fetchData();
        } else {
          alert('เกิดข้อผิดพลาด: ' + result.error);
        }
      } catch (err: any) {
        alert('อ่านไฟล์ล้มเหลว: ' + err.message);
      } finally {
        setUploadingExcel(false);
        setExcelStatus('');
        // reset input
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredEvents = events.filter(ev => String(ev.eventName).toLowerCase().includes(searchEvent.toLowerCase()));
  const filteredStudents = allStudents.filter(s => String(s.roomName).toLowerCase().includes(searchStudent.toLowerCase()) || String(s.fullName).toLowerCase().includes(searchStudent.toLowerCase()));
  const filteredRooms = rooms.filter(rm => String(rm.roomName).toLowerCase().includes(searchRoom.toLowerCase()));

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-red-900">แอดมิน: แดชบอร์ดห้องเรียนสีขาว</h1>
      
      <div className="flex gap-2 mb-6">
        <button onClick={()=>setActiveTab('events')} className={`px-6 py-3 rounded-full font-bold shadow-md transition ${activeTab === 'events' ? 'bg-gradient-to-r from-red-700 to-red-900 text-white' : 'bg-white border-2 border-gray-200 text-red-800 hover:bg-red-50'}`}>จัดการกิจกรรม</button>
        <button onClick={()=>setActiveTab('reports')} className={`px-6 py-3 rounded-full font-bold shadow-md transition ${activeTab === 'reports' ? 'bg-gradient-to-r from-red-700 to-red-900 text-white' : 'bg-white border-2 border-gray-200 text-red-800 hover:bg-red-50'}`}>ดูรายงานการส่ง</button>
        <button onClick={()=>setActiveTab('students')} className={`px-6 py-3 rounded-full font-bold shadow-md transition ${activeTab === 'students' ? 'bg-gradient-to-r from-red-700 to-red-900 text-white' : 'bg-white border-2 border-gray-200 text-red-800 hover:bg-red-50'}`}>จัดการรายชื่อนักเรียน</button>
      </div>

      {activeTab === 'events' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-red-900">สร้างกิจกรรมใหม่</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อกิจกรรม (เช่น วันพ่อ, วันแม่)</label>
                <input type="text" value={eventName} onChange={e=>setEventName(e.target.value)} required className="w-full border-2 border-red-100 p-3 rounded-2xl focus:ring-2 focus:ring-red-400 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">วันที่จัดกิจกรรม</label>
                <input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} required className="w-full border-2 border-red-100 p-3 rounded-2xl focus:ring-2 focus:ring-red-400 outline-none" />
              </div>
              <div className="flex items-center gap-2 bg-red-50 p-3 rounded-2xl border-2 border-red-100">
                <input type="checkbox" checked={hasExtraField} onChange={e=>setHasExtraField(e.target.checked)} className="w-5 h-5 text-red-700" />
                <label className="font-bold text-sm text-red-950">ต้องการช่องกรอกข้อมูลพิเศษ (เช่น ชื่อผู้ปกครองดีเด่น)</label>
              </div>
              {hasExtraField && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">หัวข้อช่องกรอกพิเศษ</label>
                  <input type="text" value={extraFieldLabel} onChange={e=>setExtraFieldLabel(e.target.value)} required className="w-full border-2 border-red-100 p-3 rounded-2xl focus:ring-2 focus:ring-red-400 outline-none" />
                </div>
              )}
              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-2xl border-2 border-blue-100">
                <input type="checkbox" checked={hasAttachment} onChange={e=>setHasAttachment(e.target.checked)} className="w-5 h-5 text-blue-600" />
                <label className="font-bold text-sm text-blue-900">ต้องการให้อัปโหลดหลักฐานรูปภาพ</label>
              </div>
              <button disabled={loading} className="w-full bg-gradient-to-r from-red-700 to-red-900 text-white py-4 rounded-3xl font-bold shadow-lg hover:bg-red-950 transition">{loading ? "กำลังสร้าง..." : "บันทึกกิจกรรม"}</button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-gray-200 overflow-auto max-h-[36rem]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-900">รายการกิจกรรมทั้งหมด</h2>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="ค้นหากิจกรรม..." value={searchEvent} onChange={e=>setSearchEvent(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-red-100 rounded-2xl focus:ring-2 focus:ring-red-400 outline-none" />
            </div>

            <div className="space-y-3">
              {filteredEvents.map((ev, i) => (
                <div key={i} className="border-2 border-red-100 bg-red-50/50 p-4 rounded-2xl">
                  <div className="font-bold text-lg text-red-950">{ev.eventName}</div>
                  <div className="text-sm text-gray-600 font-medium">วันที่: {ev.date}</div>
                </div>
              ))}
              {filteredEvents.length === 0 && <div className="text-center text-gray-500 py-4">ไม่พบข้อมูลกิจกรรม</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-red-900">สถานะการส่งชื่อแต่ละห้อง</h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="ค้นหาชื่อห้อง..." value={searchRoom} onChange={e=>setSearchRoom(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-red-100 rounded-2xl focus:ring-2 focus:ring-red-400 outline-none" />
            </div>
          </div>

          <div className="space-y-8">
            {events.map(ev => {
              const evAtt = attendance.filter(a => a.eventId === ev.eventId);
              return (
                <div key={ev.eventId} className="border-2 border-gray-200 bg-red-50/30 p-6 rounded-3xl shadow-sm">
                  <h3 className="text-xl font-bold bg-white border-2 border-gray-200 text-red-900 p-3 rounded-2xl mb-6 shadow-sm inline-block">
                    {ev.eventName} (ส่งแล้ว {evAtt.length} / {rooms.length} ห้อง)
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {filteredRooms.map(room => {
                      const submitted = evAtt.find(a => String(a.roomName).trim() === String(room.roomName).trim());
                      return (
                        <div key={room.roomName} className={`p-3 border-2 rounded-2xl text-center shadow-sm flex flex-col items-center justify-center h-24 ${submitted ? 'bg-red-100 border-red-300 text-red-950' : 'bg-red-50 border-red-200 text-red-600'}`}>
                          <span className="font-bold text-lg">{room.roomName}</span>
                          {submitted ? <CheckCircle size={24} className="mt-2 text-red-700" /> : <XCircle size={24} className="mt-2 text-red-400 opacity-50" />}
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

      {activeTab === 'students' && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-gray-200 text-center max-w-4xl mx-auto mt-8">
          <h2 className="text-2xl font-bold mb-4 text-red-900">อัปโหลดรายชื่อนักเรียนทั้งหมด (Excel)</h2>
          <p className="text-gray-600 mb-6 text-sm">
            เตรียมไฟล์ Excel (.xlsx) ให้คอลัมน์เรียงตามนี้ (ไม่มีหัวตารางก็ได้): <br/>
            <b>คอลัมน์ A:</b> ชื่อห้อง (เช่น ม.4/1)<br/>
            <b>คอลัมน์ B:</b> รหัสนักเรียน<br/>
            <b>คอลัมน์ C:</b> เลขที่<br/>
            <b>คอลัมน์ D:</b> ชื่อ-นามสกุล (เช่น ด.ช. สมชาย ใจดี)
          </p>
          
          <div className="border-4 border-dashed border-red-200 bg-red-50 p-8 rounded-3xl">
            {uploadingExcel ? (
              <div className="text-red-800 font-bold animate-pulse">{excelStatus}</div>
            ) : (
              <div>
                <label className="cursor-pointer bg-gradient-to-r from-red-700 to-red-900 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:from-red-800 hover:to-red-950 transition inline-block">
                  เลือกไฟล์ Excel เพื่ออัปโหลด
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>
          <p className="text-red-500 text-xs mt-4 font-bold mb-8">* คำเตือน: การอัปโหลดไฟล์ใหม่ จะลบข้อมูลรายชื่อนักเรียนเก่าในระบบทิ้งทั้งหมด และแทนที่ด้วยไฟล์นี้</p>

          {/* Student Viewer */}
          <div className="mt-8 border-t-2 border-gray-100 pt-8 text-left">
            <h3 className="text-xl font-bold text-red-900 mb-4">รายชื่อนักเรียนในระบบตอนนี้ ({allStudents.length} คน)</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="ค้นหาชื่อห้อง (เช่น ม.4/1) หรือชื่อนักเรียน..." value={searchStudent} onChange={e=>setSearchStudent(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-400 outline-none" />
            </div>

            <div className="overflow-x-auto rounded-2xl border-2 border-gray-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-red-50 text-red-900 uppercase">
                  <tr>
                    <th className="px-4 py-3">ห้อง</th>
                    <th className="px-4 py-3">รหัส</th>
                    <th className="px-4 py-3">เลขที่</th>
                    <th className="px-4 py-3">ชื่อ-สกุล</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.slice(0, 50).map((s, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">{s.roomName}</td>
                      <td className="px-4 py-3">{s.studentId}</td>
                      <td className="px-4 py-3">{s.number}</td>
                      <td className="px-4 py-3">{s.fullName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredStudents.length > 50 && (
              <div className="text-center text-gray-500 mt-4 text-xs">* แสดงผลการค้นหาสูงสุด 50 รายการ (จากทั้งหมด {filteredStudents.length}) เพื่อความรวดเร็ว</div>
            )}
            {filteredStudents.length === 0 && (
              <div className="text-center text-gray-500 mt-4 py-8">ไม่พบรายชื่อนักเรียนในระบบ (กรุณาอัปโหลดไฟล์ Excel)</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
