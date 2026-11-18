import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/providers/app-provider";
import { AuthShell } from "@/components/layout/auth-shell";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/providers/language-provider";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = (await cookies()).get("mfu-language")?.value === "en" ? "en" : "th";
  return (
    <html lang={language} className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-screen font-sans antialiased"><LanguageProvider initialLanguage={language}><AppProvider><AuthShell>{children}</AuthShell></AppProvider></LanguageProvider></body>
    </html>
  );
}
