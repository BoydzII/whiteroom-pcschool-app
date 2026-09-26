import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ระบบกิจกรรมห้องเรียนสีขาว",
  description: "ระบบลงชื่อเข้าร่วมกิจกรรม ห้องเรียนสีขาว",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
