import { NextRequest, NextResponse } from "next/server";
import { FoundItemPayload, FoundItemRecord } from "@/lib/types/foundItem";

// Shared memory for dev server
declare global {
  var __penga_found_db: Record<string, FoundItemRecord> | undefined;
}

if (!global.__penga_found_db) {
  global.__penga_found_db = {};
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const db = global.__penga_found_db || {};
  const report = db[id];

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({ report });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const db = global.__penga_found_db || {};
  const existing = db[id];

  if (!existing) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  try {
    const updates = (await req.json()) as Partial<FoundItemPayload>;
    const updated: FoundItemRecord = {
      ...existing,
      ...updates,
      location: {
        ...existing.location,
        ...(updates.location || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    db[id] = updated;
    return NextResponse.json({ report: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid update payload" }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const db = global.__penga_found_db || {};
  const existing = db[id];

  try {
    const body = await req.json();
    if (body.status === "returned") {
      const returnedAt = new Date().toISOString();
      if (existing) {
        existing.currentStatus = "returned";
        existing.returnedAt = returnedAt;
      }
      return NextResponse.json({ id, status: "returned", returnedAt });
    }

    return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid request" }, { status: 400 });
  }
}
