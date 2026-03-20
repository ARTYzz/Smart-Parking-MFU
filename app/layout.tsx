import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MFU Smart Parking",
  description: "ระบบจอดรถอัจฉริยะ มหาวิทยาลัยแม่ฟ้าหลวง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
