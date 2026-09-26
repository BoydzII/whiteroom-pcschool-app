"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, CalendarPlus, Skull, Clock, FileText, User } from "lucide-react";
import Link from "next/link";

export default function HomeworkDashboard() {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [homework, setHomework] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rId = localStorage.getItem('roomId');
    if (!rId) {
      router.push("/");
      return;
    }
    setRoomId(rId);
    setRoomName(localStorage.getItem('roomName') || "");
    setUserRole(localStorage.getItem('userRole') || "member");
    
    fetchHomework(rId);
  }, [router]);

  const fetchHomework = async (id: string) => {
    try {
      const res = await fetch(`/api/homework?roomId=${id}`);
      const data = await res.json();
      if (data.success) {
        setHomework(data.homework || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string) => {
    if (!url) return alert("ไม่มีไฟล์แนบ");
    window.open(url, "_blank");
  };

  const generateIcs = (hw: any) => {
    const due = new Date(hw.dueDate);
    due.setHours(8, 0, 0); // Alert at 8 AM on due date (or they can customize)
    
    const startStr = due.toISOString().replace(/-|:|\.\d+/g, "");
    const endStr = new Date(due.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, "");

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:ส่งการบ้าน: ${hw.subject}
DESCRIPTION:ประเภท: ${hw.type}\\nผู้สอน: ${hw.teacher}
BEGIN:VALARM
TRIGGER:-PT12H
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `homework_${hw.subject}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">กำลังโหลดการบ้าน...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ห้องเรียน {roomName}</h1>
            <p className="text-gray-500">สถานะ: {userRole === 'admin' ? 'หัวหน้าห้อง (ผู้เพิ่มการบ้าน)' : 'นักเรียน'}</p>
          </div>
          <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-xl font-bold">
            {homework.length} งาน
          </div>
        </div>

        {homework.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500">ยังไม่มีการบ้านในห้องนี้ 🎉</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homework.map((hw: any) => {
              const skulls = Array(Number(hw.priority) || 1).fill('💀');
              const due = new Date(hw.dueDate);
              const isOverdue = due < new Date();
              
              return (
                <div key={hw.hwId} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${isOverdue ? 'border-red-500' : 'border-indigo-500'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-800">{hw.subject}</h2>
                    <div className="flex gap-1" title={`ความสำคัญระดับ ${hw.priority}`}>
                      {skulls.map((s, i) => <span key={i} className="text-lg">{s}</span>)}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText size={16} className="text-gray-400" />
                      <span>{hw.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User size={16} className="text-gray-400" />
                      <span>ครูผู้สอน: {hw.teacher}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock size={16} className={isOverdue ? 'text-red-500' : 'text-orange-500'} />
                      <span className={isOverdue ? 'text-red-500' : 'text-orange-600'}>
                        กำหนดส่ง: {due.toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => handleDownload(hw.fileUrl)}
                      className="flex-1 bg-blue-50 text-blue-700 font-medium py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                    >
                      <Download size={18} />
                      โหลดไฟล์
                    </button>
                    <button
                      onClick={() => generateIcs(hw)}
                      className="flex-1 bg-indigo-50 text-indigo-700 font-medium py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                    >
                      <CalendarPlus size={18} />
                      แจ้งเตือน
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {userRole === 'admin' && (
        <Link 
          href="/homework/add" 
          className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-transform hover:scale-105"
        >
          <Plus size={32} />
        </Link>
      )}
    </div>
  );
}
