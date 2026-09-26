import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-sarabun",
});

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
      <body className={`${sarabun.variable} antialiased`} style={{ fontFamily: "'Times New Roman', var(--font-sarabun), sans-serif" }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
