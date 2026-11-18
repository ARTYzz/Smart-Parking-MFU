"use client";
import { useLanguage } from "@/components/providers/language-provider";
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const english = language === "en";
  return <button type="button" onClick={() => setLanguage(english ? "th" : "en")} aria-label={english ? "Switch language to Thai" : "เปลี่ยนภาษาเป็นอังกฤษ"} title={english ? "เปลี่ยนเป็นภาษาไทย" : "Switch to English"} className="flex h-11 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 text-xs font-bold text-[#59413f] shadow-sm hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7d000f]">
    <svg aria-hidden="true" viewBox="0 0 30 20" className="h-4 w-6 overflow-hidden rounded-sm">{english ? <><path fill="#24356b" d="M0 0h30v20H0z"/><path d="m0 0 30 20M30 0 0 20" stroke="white" strokeWidth="4"/><path d="m0 0 30 20M30 0 0 20" stroke="#c83242" strokeWidth="1.5"/><path d="M15 0v20M0 10h30" stroke="white" strokeWidth="7"/><path d="M15 0v20M0 10h30" stroke="#c83242" strokeWidth="4"/></> : <><path fill="#ae283a" d="M0 0h30v20H0z"/><path fill="#fff" d="M0 3h30v14H0z"/><path fill="#28345c" d="M0 6h30v8H0z"/></>}</svg>
    {english ? "EN" : "TH"}
  </button>;
}
