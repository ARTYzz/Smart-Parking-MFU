import { authService, parkingMode } from "./index";

export const vehicleTypes = ["sedan", "hatchback", "suv", "pickup", "van", "motorcycle", "other"] as const;
export type VehicleCategory = typeof vehicleTypes[number];
export type VehicleStatus = "pending" | "approved" | "rejected";
export interface RegisteredVehicle {
  id: string; userId: string; plate: string; province: string; brand: string;
  category: VehicleCategory; status: VehicleStatus; submittedAt: string;
  reviewedAt: string | null; reviewNote: string | null; evidence?: File;
}
export interface VehicleRequest { plate: string; province: string; brand: string; category: VehicleCategory; evidence: File; submissionId?: string }
export interface VehicleService {
  list(userId: string): Promise<RegisteredVehicle[]>;
  submit(userId: string, request: VehicleRequest): Promise<void>;
  remove(userId: string, id: string): Promise<void>;
}
export class VehicleError extends Error {}
export const liveVehicleReviews = parkingMode === "api";
export const vehicleEvidenceLimit = liveVehicleReviews ? 3 : 5;
async function authorize(userId: string) {
  if ((await authService.getSession())?.id !== userId) throw new VehicleError("session");
}
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("mfu-vehicle-demo", 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore("vehicles", { keyPath: "id" });
      store.createIndex("owner", "userId");
      store.createIndex("plate", ["userId", "plate", "province"], { unique: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new VehicleError("storage"));
    request.onblocked = () => reject(new VehicleError("storage"));
  });
}
export function validateVehicle(input: VehicleRequest) {
  if (!input.plate.trim() || input.plate.trim().length > 20 || !input.province.trim() || input.province.trim().length > 60 || !input.brand.trim() || input.brand.trim().length > 60 || !vehicleTypes.includes(input.category)) throw new VehicleError("fields");
  if (!input.evidence || !["image/jpeg", "image/png", "application/pdf"].includes(input.evidence.type) || input.evidence.size === 0 || input.evidence.size > vehicleEvidenceLimit * 1024 * 1024) throw new VehicleError("file");
}
// Browser-only demonstration adapter. Production needs private storage and server ownership/RLS.
const demoVehicleService: VehicleService = {
  async list(userId) {
    await authorize(userId);
    const db = await database();
    try {
      return await new Promise<RegisteredVehicle[]>((resolve, reject) => {
        const request = db.transaction("vehicles").objectStore("vehicles").index("owner").getAll(userId);
        request.onsuccess = () => resolve(request.result.sort((a: RegisteredVehicle, b: RegisteredVehicle) => b.submittedAt.localeCompare(a.submittedAt)));
        request.onerror = () => reject(new VehicleError("storage"));
      });
    } finally { db.close(); }
  },
  async submit(userId, input) {
    validateVehicle(input); await authorize(userId);
    const db = await database();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("vehicles", "readwrite");
        tx.objectStore("vehicles").add({ ...input, plate: input.plate.trim().replace(/\s+/g, "").toUpperCase(), province: input.province.trim(), brand: input.brand.trim(),
          id: crypto.randomUUID(), userId, status: "pending", submittedAt: new Date().toISOString(), reviewedAt: null, reviewNote: null } satisfies RegisteredVehicle);
        tx.oncomplete = () => resolve();
        tx.onabort = () => reject(new VehicleError(tx.error?.name === "ConstraintError" ? "duplicate" : "storage"));
        tx.onerror = () => {}; // Report after transaction abort, never show success before commit.
      });
    } finally { db.close(); }
  },
  async remove(userId, id) {
    await authorize(userId); const db = await database();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("vehicles", "readwrite"), store = tx.objectStore("vehicles");
        const request = store.get(id);
        request.onsuccess = () => { if (request.result?.userId === userId) store.delete(id); else tx.abort(); };
        tx.oncomplete = () => resolve(); tx.onabort = () => reject(new VehicleError("storage"));
      });
    } finally { db.close(); }
  },
};

interface AdminReview {
  id: string; plate: string; province: string; brand: string; vehicleType: string;
  status: VehicleStatus; createdAt: number; reviewedAt: number | null; reason: string | null;
}

async function vehicleResponse(init?: RequestInit) {
  const response = await fetch("/api/vehicles", { ...init, cache: "no-store" });
  if (response.ok) return response.json();
  if (response.status === 401) throw new VehicleError("session");
  if (response.status === 413 || response.status === 415) throw new VehicleError("file");
  if (response.status === 422) throw new VehicleError("fields");
  if (response.status === 409) throw new VehicleError("conflict");
  throw new VehicleError("integration");
}

const adminVehicleService: VehicleService = {
  async list(userId) {
    await authorize(userId);
    const { data } = await vehicleResponse() as { data: { items: AdminReview[] } };
    return data.items.map((row) => ({
      id: row.id, userId, plate: row.plate, province: row.province, brand: row.brand,
      category: vehicleTypes.find((type) => type === row.vehicleType.toLowerCase()) ?? "other",
      status: row.status, submittedAt: new Date(row.createdAt).toISOString(),
      reviewedAt: row.reviewedAt === null ? null : new Date(row.reviewedAt).toISOString(), reviewNote: row.reason,
    }));
  },
  async submit(userId, input) {
    validateVehicle(input);
    await authorize(userId);
    const form = new FormData();
    form.set("id", input.submissionId ?? crypto.randomUUID());
    form.set("plate", input.plate.trim().replace(/\s+/g, "").toUpperCase());
    form.set("province", input.province.trim());
    form.set("brand", input.brand.trim());
    form.set("vehicleType", input.category === "suv" ? "SUV" : input.category[0].toUpperCase() + input.category.slice(1));
    form.set("evidence", input.evidence);
    await vehicleResponse({ method: "POST", body: form });
  },
  async remove() { throw new VehicleError("integration"); },
};

export const vehicleService = liveVehicleReviews ? adminVehicleService : demoVehicleService;
