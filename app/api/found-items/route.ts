import { NextRequest, NextResponse } from "next/server";
import { FoundItemPayload, FoundItemRecord, FoundItemResponse } from "@/lib/types/foundItem";

// In-memory store for server lifetime
const serverDb: Record<string, FoundItemRecord> = {};

function generateRefCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const num = Math.floor(1000 + Math.random() * 9000);
  const prefix = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  return `FND-${prefix}-${num}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FoundItemPayload;

    if (!body.itemName || !body.category || !body.photos?.length || !body.location?.building) {
      return NextResponse.json(
        { error: "Missing required fields (itemName, category, photos, building)" },
        { status: 400 }
      );
    }

    const id = "fnd_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const referenceCode = generateRefCode();
    const createdAt = new Date().toISOString();

    // Simulated matching logic
    const isHighMatch = ["Electronics", "ID/Card", "Keys", "Bag"].includes(body.category);
    const immediateMatchFound = isHighMatch && Math.random() > 0.35;

    const record: FoundItemRecord = {
      ...body,
      id,
      referenceCode,
      createdAt,
      currentStatus: body.status,
    };

    serverDb[id] = record;

    const response: FoundItemResponse = {
      id,
      referenceCode,
      createdAt,
      immediateMatchFound,
      matchCount: immediateMatchFound ? 1 : 0,
      report: record,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid request payload" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ reports: Object.values(serverDb) });
}
