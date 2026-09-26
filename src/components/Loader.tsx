
"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Loader() {
  const [petals, setPetals] = useState<any[]>([]);

  useEffect(() => {
    // Generate 20 falling petals with random positions, delays, and durations
    const newPetals = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // 0 to 100%
      animationDelay: Math.random() * 2, // 0 to 2s
      animationDuration: 3 + Math.random() * 4, // 3 to 7s
      opacity: 0.4 + Math.random() * 0.6,
      scale: 0.5 + Math.random() * 0.8,
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 bg-white/90 z-[100] flex flex-col items-center justify-center overflow-hidden">
      {/* Falling Petals Background */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute top-[-10%] animate-fall"
          style={{
            left: `${petal.left}%`,
            animationDelay: `${petal.animationDelay}s`,
            animationDuration: `${petal.animationDuration}s`,
            opacity: petal.opacity,
            transform: `scale(${petal.scale})`,
          }}
        >
          {/* Petal shape (Red Padauk style) */}
          <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-800 rounded-[50%_0_50%_50%] rotate-45 shadow-sm" />
        </div>
      ))}

      {/* Center Logo with Pulse */}
      <div className="relative z-10 flex flex-col items-center animate-pulse-slow">
        <Image src="/logo.png" alt="Loading" width={120} height={120} className="object-contain drop-shadow-xl mb-4" />
        <h2 className="text-xl font-bold text-red-800 tracking-wider">กำลังโหลดข้อมูล...</h2>
      </div>

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg) scale(1);
          }
          100% {
            transform: translateY(110vh) rotate(360deg) scale(0.8);
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
