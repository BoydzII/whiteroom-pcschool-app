
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

export default function AppHub() {
  const apps = [
    {
      title: 'ห้องเรียนสีขาว',
      description: 'ระบบลงชื่อเข้าร่วมกิจกรรม และรายงานผลโครงการห้องเรียนสีขาว',
      icon: <ShieldCheck size={48} className="text-red-600" />,
      url: '/',
      bg: 'bg-red-50',
      border: 'border-red-200',
      hover: 'hover:border-red-400 hover:shadow-red-200'
    },
    {
      title: 'เวรทำความสะอาด',
      description: 'ระบบเช็คชื่อการทำเวรทำความสะอาดประจำวันของนักเรียน',
      icon: <Sparkles size={48} className="text-blue-600" />,
      url: 'https://duty-app-url.vercel.app', // เปลี่ยนเป็น URL ของแอปเวร
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      hover: 'hover:border-blue-400 hover:shadow-blue-200'
    },
    {
      title: 'สั่งและส่งการบ้าน',
      description: 'ระบบแจ้งเตือนการบ้าน กำหนดส่ง และอัปโหลดใบงาน',
      icon: <BookOpen size={48} className="text-emerald-600" />,
      url: 'https://homework-app-url.vercel.app', // เปลี่ยนเป็น URL ของแอปการบ้าน
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      hover: 'hover:border-emerald-400 hover:shadow-emerald-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="w-32 h-32 overflow-hidden rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white bg-white">
            <Image 
              src="/logo.png" 
              alt="School Logo" 
              width={200} 
              height={200} 
              className="max-w-none object-cover transform scale-[1.7] translate-y-3" 
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">ศูนย์รวมแอปพลิเคชัน</h1>
          <p className="text-gray-500 text-lg">โรงเรียนปากช่อง จังหวัดนครราชสีมา</p>
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {apps.map((app, index) => (
            <Link href={app.url} key={index} target={app.url.startsWith('http') ? "_blank" : "_self"}>
              <div className={`flex flex-col items-center text-center p-8 rounded-3xl border-2 ${app.border} ${app.bg} shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${app.hover} h-full cursor-pointer bg-white`}>
                <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm">
                  {app.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">{app.title}</h2>
                <p className="text-gray-600 text-sm">{app.description}</p>
                <div className="mt-auto pt-6">
                  <span className="inline-block px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-bold shadow-md hover:bg-gray-800 transition">เข้าสู่ระบบ</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} โรงเรียนปากช่อง ระบบบริหารจัดการดิจิทัล
        </div>
      </div>
    </div>
  );
}
