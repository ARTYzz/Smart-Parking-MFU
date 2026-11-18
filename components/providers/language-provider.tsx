"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createTranslator, type Language } from "@/lib/i18n/messages";

const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void; t: ReturnType<typeof createTranslator>; locale: string }>({ language: "th", setLanguage: () => {}, t: createTranslator("th"), locale: "th-TH" });
export function LanguageProvider({ initialLanguage, children }: { initialLanguage: Language; children: ReactNode }) {
  const [language, setValue] = useState(initialLanguage);
  const router = useRouter();
  function setLanguage(value: Language) {
    setValue(value);
    document.cookie = `mfu-language=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    document.documentElement.lang = value;
    router.refresh();
  }
  return <LanguageContext.Provider value={{ language, setLanguage, t: createTranslator(language), locale: language === "th" ? "th-TH" : "en-GB" }}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
