import { FoundItemPayload, FoundItemResponse, FoundItemRecord } from "../types/foundItem";

const LOCAL_REPORTS_KEY = "penga:found-reports-db";

function generateRefCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const num = Math.floor(1000 + Math.random() * 9000);
  const prefix = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  return `FND-${prefix}-${num}`;
}

function getLocalReports(): Record<string, FoundItemRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalReport(report: FoundItemRecord): void {
  if (typeof window === "undefined") return;
  try {
    const db = getLocalReports();
    db[report.id] = report;
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn("Failed to store local report:", e);
  }
}

/**
 * Submits a new found item report.
 * Makes HTTP POST to /api/found-items if live, with robust mock fallback.
 */
export async function submitFoundItem(payload: FoundItemPayload): Promise<FoundItemResponse> {
  // TODO: replace mock with live API endpoint when backend matching engine is connected
  try {
    const res = await fetch("/api/found-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      // Also cache in local DB for offline/client routing
      if (data.report) {
        saveLocalReport(data.report);
      }
      return data;
    }
  } catch {
    // Network or server mock fallback
  }

  // Client-side fallback / local simulation
  await new Promise((r) => setTimeout(r, 600)); // Simulate realistic network latency

  const id = "fnd_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const referenceCode = generateRefCode();
  const createdAt = new Date().toISOString();

  // Simulate smart matching: e.g. electronics or bags found in library/campus center have a simulated instant match
  const isHighMatchCategory = ["Electronics", "ID/Card", "Keys", "Bag"].includes(payload.category);
  const immediateMatchFound = isHighMatchCategory && Math.random() > 0.35;

  const record: FoundItemRecord = {
    ...payload,
    id,
    referenceCode,
    createdAt,
    currentStatus: payload.status,
  };

  saveLocalReport(record);

  return {
    id,
    referenceCode,
    createdAt,
    immediateMatchFound,
    matchCount: immediateMatchFound ? 1 : 0,
    report: record,
  };
}

/**
 * Fetches a single found report by ID
 */
export async function getFoundItem(id: string): Promise<FoundItemRecord | null> {
  // TODO: replace mock with live API endpoint
  try {
    const res = await fetch(`/api/found-items/${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = await res.json();
      return data.report;
    }
  } catch {
    // fallback to local store
  }

  const db = getLocalReports();
  return db[id] || null;
}

/**
 * Updates a found item report (e.g. edit fields)
 */
export async function updateFoundItem(id: string, updates: Partial<FoundItemPayload>): Promise<FoundItemRecord> {
  // TODO: replace mock with live API endpoint
  try {
    const res = await fetch(`/api/found-items/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      saveLocalReport(data.report);
      return data.report;
    }
  } catch {
    // fallback
  }

  const db = getLocalReports();
  const existing = db[id];
  if (!existing) {
    throw new Error("Report not found");
  }

  const updated: FoundItemRecord = {
    ...existing,
    ...updates,
    location: {
      ...existing.location,
      ...(updates.location || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  saveLocalReport(updated);
  return updated;
}

/**
 * Marks a found item as returned (closes report)
 */
export async function markItemAsReturned(id: string): Promise<{ id: string; status: "returned"; returnedAt: string }> {
  // TODO: replace mock with live API endpoint
  try {
    const res = await fetch(`/api/found-items/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "returned" }),
    });
    if (res.ok) {
      const data = await res.json();
      const db = getLocalReports();
      if (db[id]) {
        db[id].currentStatus = "returned";
        db[id].returnedAt = data.returnedAt;
        saveLocalReport(db[id]);
      }
      return data;
    }
  } catch {
    // fallback
  }

  const returnedAt = new Date().toISOString();
  const db = getLocalReports();
  if (db[id]) {
    db[id].currentStatus = "returned";
    db[id].returnedAt = returnedAt;
    saveLocalReport(db[id]);
  }

  return { id, status: "returned", returnedAt };
}
