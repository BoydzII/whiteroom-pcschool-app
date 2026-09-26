
"use client";
import Loader from '@/components/Loader';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Papa from 'papaparse';
import { Upload, Save, CheckSquare, Square, X } from 'lucide-react';

export default function AttendancePage() {
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>({}); // {[id]: true/false}
  
  // Extra Fields
  const [extraValue, setExtraValue] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const roomName = localStorage.getItem('wr_roomName');
    if (!roomName) {
      router.push('/');
      return;
    }
    fetchData(roomName);
  }, []);

  const fetchData = async (roomName: string) => {
    // 1. Fetch Event Details
    const res = await fetch('/api/events?t=' + Date.now());
    const data = await res.json();
    const ev = data.events?.find((e: any) => e.eventId === params.eventId);
    if (!ev) {
      alert("ไม่พบกิจกรรมนี้");
      router.push('/events');
      return;
    }
    setEvent(ev);

    // 2. Load Students from API (Google Sheets)
    const resStu = await fetch(`/api/students?roomName=${encodeURIComponent(roomName)}&t=` + Date.now());
    const dataStu = await resStu.json();
    if (dataStu.success) {
      const roomStudents = dataStu.students || [];
      // Sort by number if possible
      roomStudents.sort((a:any, b:any) => parseInt(a.number) - parseInt(b.number));
      setStudents(roomStudents);
      
      const att: any = {};
      roomStudents.forEach((s: any) => {
        att[s.studentId] = true; 
      });
      setAttendance(att);
    } else {
      alert("ไม่สามารถดึงรายชื่อนักเรียนได้");
    }
    setLoading(false);
  };

  const toggleStudent = (id: string) => {
    setAttendance((prev: any) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("ขนาดไฟล์ใหญ่เกินไป (จำกัด 5MB)");
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => setFileBase64(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (event.hasExtraField === 'YES' && !extraValue) {
      return alert(`กรุณากรอก: ${event.extraFieldLabel}`);
    }
    if (event.hasAttachment === 'YES' && !fileBase64) {
      const c = confirm("กิจกรรมนี้ต้องการรูปภาพหลักฐาน คุณยังไม่ได้แนบรูป ต้องการส่งโดยไม่มีรูปหรือไม่?");
      if(!c) return;
    }

    const presentIds = Object.keys(attendance).filter(id => attendance[id]).join(',');
    const absentIds = Object.keys(attendance).filter(id => !attendance[id]).join(',');

    setSubmitting(true);
    const res = await fetch('/api/attendance', {
      method: 'POST',
      body: JSON.stringify({
        eventId: params.eventId,
        roomName: localStorage.getItem('wr_roomName'),
        advisorName: localStorage.getItem('wr_advisor'),
        presentIds,
        absentIds,
        extraFieldValue: extraValue,
        fileBase64
      })
    });
    const result = await res.json();
    setSubmitting(false);

    if (result.success) {
      alert("บันทึกการเข้าร่วมกิจกรรมสำเร็จ!");
      router.push('/events');
    } else {
      alert("เกิดข้อผิดพลาด: " + result.error);
    }
  };

  if (loading) return <Loader />;

  const presentCount = Object.values(attendance).filter(v => v).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">{event.eventName}</h1>
          <p className="opacity-90">ห้อง {localStorage.getItem('wr_roomName')} | รายชื่อนักเรียน {students.length} คน</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 mt-4">
        
        {/* Extra Fields Section */}
        {(event.hasExtraField === 'YES' || event.hasAttachment === 'YES') && (
          <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-red-200">
            <h2 className="text-xl font-bold mb-4 text-red-900">ข้อมูลเพิ่มเติม</h2>
            
            {event.hasExtraField === 'YES' && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">{event.extraFieldLabel}</label>
                <input 
                  type="text" 
                  value={extraValue} 
                  onChange={e=>setExtraValue(e.target.value)} 
                  className="w-full border-2 border-gray-200 p-3 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none" 
                  placeholder="กรอกข้อมูลที่นี่..."
                />
              </div>
            )}

            {event.hasAttachment === 'YES' && (
              <div>
                <label className="block text-sm font-bold mb-1">แนบรูปภาพ/หลักฐาน</label>
                {fileBase64 ? (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-gray-200 rounded-lg">
                    <span className="truncate flex-1">{fileName}</span>
                    <button onClick={()=>{setFileBase64(''); setFileName('');}} className="text-red-500 p-1 hover:bg-red-50 rounded"><X size={20}/></button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 border-4 border-dashed border-gray-200 rounded-3xl text-gray-500 hover:bg-gray-50 flex flex-col items-center gap-2">
                    <Upload size={24} /> แตะเพื่อเลือกรูปภาพ
                  </button>
                )}
                <input type="file" accept="image/*,application/pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>
            )}
          </div>
        )}

        {/* Attendance Section */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-red-200 overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
            <h2 className="text-lg font-bold">รายชื่อผู้เข้าร่วมกิจกรรม</h2>
            <div className="flex gap-4 text-sm font-bold">
              <span className="text-red-700">เข้าร่วม {presentCount}</span>
              <span className="text-red-600">ขาด {absentCount}</span>
            </div>
          </div>
          <div className="divide-y max-h-[60vh] overflow-y-auto">
            {students.map(s => {
              const isPresent = attendance[s.studentId];
              return (
                <div 
                  key={s.studentId} 
                  onClick={() => toggleStudent(s.studentId)}
                  className={`flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 ${isPresent ? '' : 'bg-red-50'}`}
                >
                  <div>
                    <div className="font-bold text-gray-800">{s.fullName}</div>
                    <div className="text-sm text-gray-500">รหัส: {s.studentId} | เลขที่: {s.number}</div>
                  </div>
                  <div>
                    {isPresent ? (
                      <CheckSquare size={28} className="text-red-600" />
                    ) : (
                      <Square size={28} className="text-red-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Button (Sticky) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleSubmit} 
          disabled={submitting}
          className="w-full max-w-4xl mx-auto flex justify-center items-center gap-2 bg-gradient-to-r from-red-700 to-red-900 text-white font-bold py-4 rounded-xl hover:bg-red-950 disabled:opacity-50"
        >
          <Save size={24} />
          {submitting ? "กำลังบันทึกข้อมูล..." : "บันทึกและส่งข้อมูล"}
        </button>
      </div>
    </div>
  );
}
