"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Upload, File as FileIcon } from "lucide-react";
import Link from "next/link";

export default function AddHomeworkPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("ใบงาน");
  const [teacher, setTeacher] = useState("");
  const [assignDate, setAssignDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState(3);
  
  const [fileBase64, setFileBase64] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const rId = localStorage.getItem('roomId');
    const role = localStorage.getItem('userRole');
    if (!rId || role !== 'admin') {
      alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
      router.push("/homework");
      return;
    }
    setRoomId(rId);

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    setAssignDate(today);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setDueDate(nextWeek.toISOString().split('T')[0]);
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("ขนาดไฟล์ใหญ่เกินไป (จำกัด 5MB)");
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileBase64(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !teacher || !assignDate || !dueDate) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (!fileBase64) {
      const confirmNoFile = confirm("คุณไม่ได้แนบไฟล์ใบงาน ต้องการดำเนินการต่อหรือไม่?");
      if (!confirmNoFile) return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          subject,
          type,
          teacher,
          assignDate,
          dueDate,
          priority,
          fileBase64,
          creatorRole: 'admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("บันทึกการบ้านสำเร็จ!");
        router.push("/homework");
      } else {
        alert("ผิดพลาด: " + data.error);
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/homework" className="inline-flex items-center gap-2 text-indigo-600 mb-6 font-medium hover:underline">
          <ArrowLeft size={20} /> กลับไปหน้าการบ้าน
        </Link>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 sm:p-8 text-center text-white">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">เพิ่มการบ้าน / ใบงาน</h1>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วิชา</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="เช่น คณิตศาสตร์"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ลักษณะการบ้าน</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="ใบงาน">ใบงาน (ขนาด A4)</option>
                  <option value="แบบฝึกหัด">แบบฝึกหัด (ในหนังสือ)</option>
                  <option value="รายงาน">รายงาน</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ครูผู้สอน</label>
                <input
                  type="text"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="เช่น ครูสมศรี"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ได้รับ</label>
                <input
                  type="date"
                  value={assignDate}
                  onChange={(e) => setAssignDate(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ต้องส่ง</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">ระดับความสำคัญ (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPriority(level)}
                      className={`flex-1 py-2 text-xl rounded-lg border-2 transition-all ${priority >= level ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 opacity-50 grayscale'}`}
                    >
                      💀
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">แนบไฟล์ใบงาน / รูปภาพ (ขนาด A4)</label>
                
                {fileBase64 ? (
                  <div className="relative group p-4 border border-indigo-200 bg-indigo-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileIcon size={32} className="text-indigo-500 flex-shrink-0" />
                      <span className="font-medium text-indigo-900 truncate">{fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setFileBase64(""); setFileName(""); }}
                      className="text-red-500 hover:bg-red-100 p-2 rounded-lg text-sm font-medium transition-all"
                    >
                      ลบไฟล์
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                  >
                    <div className="bg-gray-100 p-4 rounded-full mb-3 group-hover:bg-indigo-100 transition-colors">
                      <Upload size={32} />
                    </div>
                    <span className="font-semibold">แตะเพื่ออัปโหลดไฟล์ (PDF/JPG)</span>
                    <span className="text-sm mt-1">ไฟล์จะถูกเก็บใน Google Drive ของแอดมิน</span>
                  </button>
                )}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-300 shadow-md transition-all mt-8"
            >
              <Save size={24} />
              {loading ? "กำลังอัปโหลดไฟล์ไปที่ Drive..." : "ประกาศการบ้าน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
