import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/providers/app-provider";
import { AuthShell } from "@/components/layout/auth-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: {
    default: "MFU Smart Parking",
    template: "%s | MFU Smart Parking",
  },
  description: "ระบบจอดรถอัจฉริยะ มหาวิทยาลัยแม่ฟ้าหลวง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-screen font-sans antialiased"><AppProvider><AuthShell>{children}</AuthShell></AppProvider></body>
    </html>
  );
}
