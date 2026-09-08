/** Demonstration capacities and positions, not university-verified parking data. */
export const zoneCatalog = [
  { id: "D1", left: "43%", top: "56%", car: 40, motorcycle: 20, occupied: 0.35 },
  { id: "E1", left: "55%", top: "56%", car: 60, motorcycle: 30, occupied: 0.55 },
  { id: "E2", left: "76%", top: "60%", car: 50, motorcycle: 30, occupied: 0.8 },
  { id: "C2", left: "69%", top: "58%", car: 35, motorcycle: 20, occupied: 1 },
  { id: "C3", left: "74%", top: "48%", car: 40, motorcycle: 25, occupied: 0.72 },
  { id: "C5", left: "45%", top: "40%", car: 38, motorcycle: 22, occupied: 0.5 },
  { id: "M-STORE", left: "58%", top: "88%", car: 30, motorcycle: 40, occupied: 0.25 },
] as const;
