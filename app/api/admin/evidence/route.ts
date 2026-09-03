import { NextResponse } from "next/server";
import {
  getEvidentiaryStats,
  getCandidateQueue,
  approveCandidate,
  mergeCandidate,
  rejectCandidate,
} from "@/lib/evidence-service";
import { getAuditTrail } from "@/lib/ingestion/audit";

export async function GET() {
  const stats = getEvidentiaryStats();
  const queue = getCandidateQueue();
  const audit = getAuditTrail();

  return NextResponse.json({
    stats,
    queue,
    audit,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, candidateId, targetEventId, reason, editorName } = body;

    if (!candidateId || typeof candidateId !== "string") {
      return NextResponse.json({ error: "Missing required candidateId" }, { status: 400 });
    }

    if (action === "approve") {
      const res = approveCandidate(candidateId, editorName);
      return NextResponse.json(res);
    }

    if (action === "merge") {
      if (!targetEventId || typeof targetEventId !== "string") {
        return NextResponse.json({ error: "Missing required targetEventId for merge" }, { status: 400 });
      }
      const res = mergeCandidate(candidateId, targetEventId, editorName);
      return NextResponse.json(res);
    }

    if (action === "reject") {
      const res = rejectCandidate(candidateId, reason || "Editorial rejection", editorName);
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
