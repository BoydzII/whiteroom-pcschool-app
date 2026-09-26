
"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { Upload, Save, CheckSquare, Square, X } from 'lucide-react';

export default function AttendancePage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
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

    // 2. Load Students from CSV
    const resCsv = await fetch('/student_template.csv');
    const csvText = await resCsv.text();
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Filter students for this room
        const roomStudents = results.data.filter((s: any) => String(s.Class).trim() === roomName.trim());
        setStudents(roomStudents);
        
        // Initialize all as Present by default (easier for teachers)
        const att: any = {};
        roomStudents.forEach((s: any) => {
          att[s.ID] = true; 
        });
        setAttendance(att);
        setLoading(false);
      }
    });
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

  if (loading) return <div className="p-8 text-center">กำลังเตรียมรายชื่อนักเรียน...</div>;

  const presentCount = Object.values(attendance).filter(v => v).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-emerald-600 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">{event.eventName}</h1>
          <p className="opacity-90">ห้อง {localStorage.getItem('wr_roomName')} | นักเรียนทั้งหมด {students.length} คน</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 mt-4">
        
        {/* Extra Fields Section */}
        {(event.hasExtraField === 'YES' || event.hasAttachment === 'YES') && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
            <h2 className="text-xl font-bold mb-4 text-emerald-800">ข้อมูลเพิ่มเติม</h2>
            
            {event.hasExtraField === 'YES' && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">{event.extraFieldLabel}</label>
                <input 
                  type="text" 
                  value={extraValue} 
                  onChange={e=>setExtraValue(e.target.value)} 
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="กรอกข้อมูลที่นี่..."
                />
              </div>
            )}

            {event.hasAttachment === 'YES' && (
              <div>
                <label className="block text-sm font-bold mb-1">แนบรูปภาพ/หลักฐาน</label>
                {fileBase64 ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="truncate flex-1">{fileName}</span>
                    <button onClick={()=>{setFileBase64(''); setFileName('');}} className="text-red-500 p-1 hover:bg-red-50 rounded"><X size={20}/></button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 flex flex-col items-center gap-2">
                    <Upload size={24} /> แตะเพื่อเลือกรูปภาพ
                  </button>
                )}
                <input type="file" accept="image/*,application/pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>
            )}
          </div>
        )}

        {/* Attendance Section */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
            <h2 className="text-lg font-bold">เช็คชื่อเข้าร่วม</h2>
            <div className="flex gap-4 text-sm font-bold">
              <span className="text-emerald-600">มา {presentCount}</span>
              <span className="text-red-600">ขาด {absentCount}</span>
            </div>
          </div>
          <div className="divide-y max-h-[60vh] overflow-y-auto">
            {students.map(s => {
              const isPresent = attendance[s.ID];
              return (
                <div 
                  key={s.ID} 
                  onClick={() => toggleStudent(s.ID)}
                  className={`flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 ${isPresent ? '' : 'bg-red-50'}`}
                >
                  <div>
                    <div className="font-bold text-gray-800">{s.Prefix}{s.FirstName} {s.LastName}</div>
                    <div className="text-sm text-gray-500">รหัส: {s.ID} | เลขที่: {s.Number}</div>
                  </div>
                  <div>
                    {isPresent ? (
                      <CheckSquare size={28} className="text-emerald-500" />
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
          className="w-full max-w-4xl mx-auto flex justify-center items-center gap-2 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
        >
          <Save size={24} />
          {submitting ? "กำลังบันทึกข้อมูล..." : "บันทึกและส่งข้อมูล"}
        </button>
      </div>
    </div>
  );
}
