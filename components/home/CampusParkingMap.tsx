"use client";
import { useLanguage } from "@/components/providers/language-provider";
import { memo, useId, useState } from "react";
import { Minus, Plus, RotateCcw, MapPin, ArrowUpRight } from "lucide-react";
import ZoneStatusCard from "./ZoneStatusCard";
import { zoneCatalog } from "@/lib/services/catalog";

export type ZoneStatus = {
  zoneId: string; totalSlots: number; occupiedSlots: number; availableSlots: number;
  bookableSlots?: number; reservedSlots?: number;
  status: "available" | "nearly_full" | "full" | "no-data"; updatedAt?: string | null;
};
const colors = { available: "#25865d", nearly_full: "#d79724", full: "#c44848", "no-data": "#89938e" };
const labels = { available: "พร้อมจอง", nearly_full: "ใกล้เต็ม", full: "เต็ม", "no-data": "ไม่มีข้อมูล" };
// C5 is a status-only inset, not a surveyed building position. E2 remains unlocated.
const pins = [
  { id: "D1", x: 168, y: 449 }, { id: "E1", x: 280, y: 426 },
  { id: "C2", x: 419, y: 429 }, { id: "C3", x: 529, y: 335 },
  { id: "M-STORE", x: 252, y: 657 },
  { id: "C5", x: 650, y: 675 },
];
const buildings = [
  ["AD2", 130, 72, 54, 63], ["S8", 111, 173, 80, 39], ["S8", 91, 234, 80, 31],
  ["S7", 75, 274, 52, 46], ["S6", 124, 342, 58, 39], ["S1", 202, 316, 48, 37],
  ["S4", 173, 278, 38, 30], ["S5", 214, 257, 39, 35], ["S3", 226, 201, 38, 36],
  ["S2", 269, 265, 39, 35], ["S1", 290, 236, 36, 30], ["AD1", 313, 188, 85, 37],
  ["C1", 399, 243, 44, 45], ["C3", 416, 301, 46, 61], ["C3", 485, 308, 96, 49],
  ["C4", 408, 366, 52, 34], ["C2", 387, 407, 65, 32], ["AS", 265, 340, 43, 39],
  ["F3", 38, 348, 44, 33], ["F2", 50, 385, 44, 33], ["F4", 20, 489, 44, 36],
  ["D1", 178, 426, 54, 47], ["E1", 259, 407, 67, 31], ["E", 217, 488, 58, 55],
  ["B", 630, 198, 61, 40], ["C", 659, 347, 62, 39], ["", 548, 400, 72, 32],
  ["", 126, 394, 76, 30], ["M-Store", 198, 622, 140, 58], ["E4", 379, 610, 103, 53],
] as const;
const road = "M-20 646 C66 610 91 561 152 561 C227 561 252 620 346 620 C441 620 460 566 534 560 C600 555 627 496 630 440 L640 350 C652 308 684 292 649 280 C611 267 567 267 576 223 C584 186 611 145 570 116 L538 95 C503 75 501 118 467 123 C413 137 401 99 355 89 C406 111 409 142 371 166 C335 185 271 178 228 192 C186 204 210 227 218 249 L162 298";
const minor = [
 "M20 179 C91 160 74 87 100 40 C131 -8 159 29 181 51 C198 68 221 45 246 62 C279 91 301 85 345 87",
 "M235 65 C262 95 213 118 236 145 L281 167", "M14 390 C100 350 126 424 99 469 C75 520 61 554 47 607",
 "M117 421 C147 452 112 485 110 519 C147 541 176 518 207 490",
 "M302 442 L307 572", "M403 290 C438 276 457 240 482 211 C510 177 533 199 530 234 C525 288 558 285 560 309",
 "M459 392 C472 362 472 331 459 307 C456 275 488 264 482 236",
 "M524 566 C548 595 558 641 585 640 C609 630 579 588 618 553 L713 440 L735 299 L725 199 L633 169 L633 143 C688 141 711 168 757 168",
 "M635 169 L621 179", "M703 273 L735 291 L760 293",
];
function CampusParkingMap({ zones }: { zones: ZoneStatus[] }) {
  const { t } = useLanguage();
  const id = useId().replace(/:/g, "");
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const getZone = (zoneId: string): ZoneStatus => zones.find(z => z.zoneId.toUpperCase() === zoneId) ??
    { zoneId, totalSlots: 0, occupiedSlots: 0, availableSlots: 0, status: "no-data" };
  const selectedZone = selected ? getZone(selected) : null;
  return <div className="overflow-hidden rounded-3xl border border-[#dce4db] bg-[#f8faf6]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce4db] px-5 py-4">
      <div><p className="text-[10px] font-bold tracking-[0.24em] text-[#738473]">{t("MAE FAH LUANG UNIVERSITY")}</p><h3 className="mt-1 font-bold text-[#273d31]">{t("Campus parking map ")}<span className="ml-2 rounded-full bg-[#e7edde] px-2 py-1 text-[10px] font-medium text-[#62745d]">{t("แผนผังสาธิต")}</span></h3></div>
      <div className="flex items-center gap-1 rounded-xl border border-[#dce4db] bg-white p-1">
        <button aria-label={t("ย่อแผนที่")} disabled={zoom === 1} onClick={() => setZoom(z => Math.max(1, z - .25))} className="rounded-lg p-2 hover:bg-stone-100 disabled:opacity-30"><Minus size={16} /></button>
        <span className="w-12 text-center text-xs tabular-nums">{t(Math.round(zoom * 100))}{t("%")}</span>
        <button aria-label={t("ขยายแผนที่")} disabled={zoom === 2} onClick={() => setZoom(z => Math.min(2, z + .25))} className="rounded-lg p-2 hover:bg-stone-100 disabled:opacity-30"><Plus size={16} /></button>
        <button aria-label={t("คืนขนาดแผนที่")} onClick={() => setZoom(1)} className="rounded-lg p-2 hover:bg-stone-100"><RotateCcw size={15} /></button>
      </div>
    </div>
    <div className="grid lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="relative min-w-0">
        <div className="max-h-[820px] overflow-auto overscroll-contain" tabIndex={0} aria-label={t("แผนที่มหาวิทยาลัย เลื่อนเพื่อสำรวจเมื่อขยาย")}>
          <div style={{ width: `${zoom * 100}%`, minWidth: 560 }}>
            <svg viewBox="0 0 760 760" className="block h-auto w-full" fontFamily="Arial, sans-serif" role="group" aria-label={t("ผังอาคารมหาวิทยาลัยแม่ฟ้าหลวงและสถานะโซนจอดรถ")}>
              <defs>
                <pattern id={id + "grid"} width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#bdcbb5" opacity=".35" /></pattern>
                <pattern id={id + "trees"} width="39" height="43" patternUnits="userSpaceOnUse"><circle cx="10" cy="12" r="9" fill="#8aa779" opacity=".38" /><circle cx="27" cy="32" r="7" fill="#769865" opacity=".25" /><circle cx="8" cy="10" r="6" fill="#acc394" opacity=".6" /></pattern>
                <pattern id={id + "parking"} width="14" height="22" patternUnits="userSpaceOnUse"><path d="M1 2 V19 H12 V2" fill="none" stroke="#fff" strokeWidth="1" /><rect x="4" y="5" width="6" height="11" rx="2" fill="#91a49b" /></pattern>
                <filter id={id + "shadow"} x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#344b3d" floodOpacity=".14" /></filter>
              </defs>
              <rect width="760" height="760" fill="#edf1e6" /><rect width="760" height="760" fill={`url(#${id}grid)`} />
              <g fill="#d3e2bf" stroke="#f8faf4" strokeWidth="5">
                <path d="M106 165 Q93 128 109 68 Q124 18 154 50 L178 74 L222 73 Q220 125 214 166Z" />
                <path d="M241 95 Q266 110 288 96 L349 100 Q389 126 367 151 L281 167 L243 142Z" />
                <path d="M404 136 Q463 151 497 118 Q529 91 549 114 Q545 163 510 181 Q470 182 438 239 L405 231Z" />
                <path d="M553 125 Q602 149 563 220 Q560 261 539 241 L523 199Z" />
                <path d="M32 207 L95 174 Q106 210 76 242 L42 302 L25 297Z" />
                <path d="M81 273 L200 233 L280 198 L282 328 L249 383 L112 380 L94 332Z" />
                <path d="M544 260 Q575 274 616 288 Q653 306 622 377 Q602 402 578 365 L567 317Z" />
                <path d="M550 437 L616 442 Q625 513 545 550 L513 549 Q517 487 550 437Z" />
                <path d="M322 375 Q349 347 377 375 L383 542 L325 542Z" />
              </g>
              <g fill={`url(#${id}trees)`}>
                <path d="M107 160 L111 65 Q130 26 155 57 L215 81 L210 159Z" />
                <path d="M405 142 Q466 160 502 123 L534 121 Q523 158 495 181 L432 227 L406 221Z" />
                <path d="M34 215 L85 188 L80 239 L39 291Z" />
                <path d="M550 448 L607 450 Q610 509 532 538Z" />
                <path d="M550 276 L610 296 Q643 306 616 368 L590 360Z" />
              </g>
              <g fill="#9bcbd1" stroke="#f9fcf8" strokeWidth="5">
                <path d="M449 563 Q428 570 442 502 L463 423 Q480 372 510 392 Q537 403 512 456 L487 536 Q479 562 449 563Z" />
                <path d="M602 634 Q590 605 632 553 L700 468 Q722 439 754 468 L754 531 Q718 625 668 646Z" />
                <ellipse cx="355" cy="581" rx="57" ry="30" />
                <path d="M102 633 Q102 607 124 580 Q148 563 175 577 L163 613 Q175 636 151 645Z" />
                <path d="M158 537 Q157 522 180 512 L207 492 L214 550 Q186 554 158 537Z" />
              </g>
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                {t(minor.map((d, i) => <g key={i}><path d={d} stroke="#fff" strokeWidth="17" /><path d={d} stroke="#c1c7bf" strokeWidth="9" /></g>))}
                <path d="M358 760 V621" stroke="#fff" strokeWidth="31" /><path d="M358 760 V621" stroke="#e8b45a" strokeWidth="20" />
                <path d={road} stroke="#fffdf4" strokeWidth="27" /><path d={road} stroke="#e8b45a" strokeWidth="17" /><path d={road} stroke="#fae3a5" strokeWidth="2" strokeDasharray="9 9" />
                <path d="M358 747 V653" stroke="#fff5d5" strokeWidth="2" strokeDasharray="9 9" />
              </g>
              <g fill="#d0d9cf">
                <rect x="123" y="424" width="47" height="51" rx="5" /><rect x="270" y="444" width="46" height="96" rx="5" />
                <rect x="390" y="443" width="36" height="97" rx="5" /><rect x="157" y="682" width="119" height="32" rx="5" />
                <rect x="380" y="672" width="120" height="38" rx="5" /><rect x="642" y="243" width="43" height="30" rx="4" />
                <rect x="660" y="393" width="44" height="34" rx="4" />
              </g>
              <g fill={`url(#${id}parking)`}>
                <rect x="128" y="427" width="40" height="44" /><rect x="273" y="445" width="42" height="91" />
                <rect x="393" y="445" width="30" height="90" /><rect x="160" y="686" width="112" height="24" />
                <rect x="383" y="678" width="112" height="26" /><rect x="646" y="245" width="39" height="25" />
                <rect x="663" y="395" width="40" height="28" />
              </g>
              <circle cx="353" cy="351" r="43" fill="#c3d1b3" stroke="#fff" strokeWidth="8" />
              <circle cx="353" cy="351" r="29" fill="#e8d6c8" stroke="#bfa995" strokeWidth="2" />
              <text x="353" y="357" textAnchor="middle" fontSize="19" fontWeight="700" fill="#76534b">{t("A")}</text>
              <path d="M297 321 A64 64 0 0 1 410 321" fill="none" stroke="#bf958c" strokeWidth="27" transform="translate(0 5)" />
              <path d="M297 321 A64 64 0 0 1 410 321" fill="none" stroke="#e6b8aa" strokeWidth="26" />
              <path d="M297 321 A64 64 0 0 1 410 321" fill="none" stroke="#f7ddd0" strokeWidth="2" />
              {t(buildings.map(([name, x, y, w, h], i) => <g key={i} filter={`url(#${id}shadow)`}>
                <rect x={x} y={y + 5} width={w} height={h} rx="3" fill="#b99488" />
                <rect x={x} y={y} width={w} height={h} rx="3" fill={name.startsWith("S") ? "#eed7ca" : "#e6bcae"} stroke="#c49d8f" strokeWidth="1.3" />
                <path d={`M${x + 5} ${y + h - 5} V${y + 5} H${x + w - 5}`} stroke="#fff2e5" strokeWidth="2" fill="none" opacity=".8" />
                <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fill="#704e46" fontSize={name === "M-Store" ? 14 : 15} fontWeight="650">{t(name)}</text>
              </g>))}
              <path d="M211 387 H226 V370 H243 V387 H261 V406 H243 V423 H226 V406 H211Z" fill="#e6bcae" stroke="#bf958c" strokeWidth="2" />
              <g fill="#79916d">{t([[315,395],[381,392],[315,414],[381,414],[315,463],[381,463],[315,496],[381,496],[315,527],[381,527],[104,340],[186,340],[601,462],[591,488],[571,516]].map(([x,y], i) => <g key={i}><circle cx={x} cy={y+2} r="7" opacity=".2"/><circle cx={x} cy={y} r="5" /></g>))}</g>
              <g transform="translate(704 57)"><circle r="24" fill="#fff" opacity=".85" /><path d="M0 -14 L7 10 L0 6 L-7 10Z" fill="#415b48" /><text y="-32" textAnchor="middle" fontSize="11" fontWeight="700" fill="#415b48">{t("N")}</text></g>
              <g transform="translate(30 704)"><path d="M0 0 V6 H75 V0 M38 0 V6" fill="none" stroke="#64755e" strokeWidth="2" /><text y="23" fontSize="10" fill="#64755e">{t("SCHEMATIC · NOT TO SCALE")}</text></g>
              <g transform="translate(387 726)"><path d="M0 10 V-7 M-5 -2 L0 -7 L5 -2" fill="none" stroke="#8b2332" strokeWidth="2.5" /><text x="14" fontSize="13" fontWeight="700" fill="#563f38">{t("ทางเข้ามหาวิทยาลัย")}</text><text x="14" y="16" fontSize="10" fill="#7c8375">{t("MAIN ENTRANCE")}</text></g>
              {t(pins.map(pin => { const zone = getZone(pin.id); const active = selected === pin.id; return <g key={pin.id} role="button" tabIndex={0} aria-label={t(`โซน ${pin.id} ${labels[zone.status]} ${zone.bookableSlots ?? zone.availableSlots} ช่อง`)} aria-pressed={active} onClick={() => setSelected(pin.id)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(pin.id); } }} className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[#7d000f] [&:hover>rect]:stroke-[#7d000f]" transform={`translate(${pin.x - 43} ${pin.y})`}>
                <path d="M36 41 L43 49 L50 41" fill="white" stroke="#d1dbce" strokeWidth="1" /><rect width="86" height="43" rx="11" fill="white" stroke={active ? "#7d000f" : "#d1dbce"} strokeWidth={active ? 3 : 1.5} filter={`url(#${id}shadow)`} />
                <rect x="7" y="7" width="16" height="16" rx="5" fill={colors[zone.status]} /><text x="15" y="19" textAnchor="middle" fontSize="11" fontWeight="800" fill="white">P</text><text x="28" y="19" fontSize="11" fontWeight="800" fill="#314b3c">{t(pin.id === "M-STORE" ? "M-Store" : pin.id)}</text>
                <text x="10" y="36" fontSize="11" fontWeight="750" fill={colors[zone.status]}>{t(zone.status === "no-data" ? "ไม่มีข้อมูล" : `${zone.bookableSlots ?? zone.availableSlots} / ${zone.totalSlots} ช่อง`)}</text>
              </g>; }))}
            </svg>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-[#dce4db] bg-white/80 px-5 py-3">
          {t(Object.entries(labels).map(([key, label]) => <span key={key} className="flex items-center gap-1.5 text-[11px] text-[#60705e]"><i className="h-2 w-2 rounded-full" style={{ background: colors[key as keyof typeof colors] }} />{t(label)}</span>))}
          <span className="text-[11px] text-[#7a8575]">{t("เลื่อนแผนที่ได้เมื่อขยาย / บนมือถือ")}</span>
        </div>
      </div>
      <aside className="border-t border-[#dce4db] bg-white/80 p-5 lg:border-l lg:border-t-0">
        <div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-bold tracking-[.2em] text-[#80917b]">{t("FIND YOUR SPACE")}</p><h4 className="mt-1 font-bold text-[#2b4235]">{t("เลือกโซนจอดรถ")}</h4></div><MapPin size={19} className="text-[#7d000f]" /></div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {t(zoneCatalog.map(({ id }) => { const zone = getZone(id); return <button key={id} onClick={() => setSelected(id)} aria-pressed={selected === id} className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-left transition-colors ${selected === id ? "border-[#7d000f]/30 bg-[#7d000f]/5" : "border-[#e4e9df] bg-white hover:bg-[#f0f4eb]"}`}>
            <span><span className="flex items-center gap-2 text-sm font-bold text-[#334636]"><i className="h-2 w-2 rounded-full" style={{ background: colors[zone.status] }} />{t(id === "M-STORE" ? "M-Store" : id)}</span><span className="mt-1 block text-[10px] text-[#7e897a]">{t(pins.some(p => p.id === id && id !== "C5") ? labels[zone.status] : "รอยืนยันตำแหน่งบนแผนที่")}</span></span>
            <span className="text-right"><strong className="block text-lg tabular-nums" style={{ color: colors[zone.status] }}>{t(zone.status === "no-data" ? "—" : zone.bookableSlots ?? zone.availableSlots)}</strong><span className="text-[9px] text-[#7e897a]">{t("ช่องพร้อมจอง")}</span></span>
          </button>; }))}
        </div>
        <div className="mt-5 rounded-xl bg-[#edf2e6] p-4 text-xs leading-relaxed text-[#64765a]"><ArrowUpRight size={18} className="mb-2" />{t("เลือกหมุดหรือรายการโซน เพื่อดูจำนวนช่องจอดและรายละเอียดด้านล่าง")}</div>
        <p className="mt-4 text-[10px] leading-relaxed text-[#90988b]">{t("วาดตำแหน่งอาคารตามภาพอ้างอิง")}<br />{t("ไม่ใช่แผนที่นำทางหรือระยะทางจริง")}</p>
      </aside>
    </div>
    <div aria-live="polite" className="border-t border-[#dce4db] bg-white px-5 pb-5">
      {t(selectedZone ? <ZoneStatusCard zone={selectedZone} /> : <p className="pt-5 text-center text-sm text-[#7c8875]">{t("เลือกโซนบนแผนที่เพื่อดูรายละเอียดที่จอดรถ")}</p>)}
    </div>
  </div>;
}

export default memo(CampusParkingMap);
