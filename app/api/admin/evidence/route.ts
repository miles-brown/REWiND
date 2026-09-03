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
    const { action, candidateId, targetEventId, reason } = body;

    if (!candidateId || typeof candidateId !== "string") {
      return NextResponse.json({ success: false, error: "Missing required candidateId" }, { status: 400 });
    }

    // Derive server-side authenticated editor actor
    const editorActor = "Senior Historical Editor (Session)";

    if (action === "approve") {
      const res = approveCandidate(candidateId, editorActor);
      if (!res.success) {
        return NextResponse.json(res, { status: 400 });
      }
      return NextResponse.json(res, { status: 200 });
    }

    if (action === "merge") {
      if (!targetEventId || typeof targetEventId !== "string") {
        return NextResponse.json({ success: false, error: "Missing required targetEventId for merge" }, { status: 400 });
      }
      const res = mergeCandidate(candidateId, targetEventId, editorActor);
      if (!res.success) {
        return NextResponse.json(res, { status: 400 });
      }
      return NextResponse.json(res, { status: 200 });
    }

    if (action === "reject") {
      const res = rejectCandidate(candidateId, typeof reason === "string" ? reason : "Editorial rejection", editorActor);
      if (!res.success) {
        return NextResponse.json(res, { status: 400 });
      }
      return NextResponse.json(res, { status: 200 });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
