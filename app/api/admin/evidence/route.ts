import { NextResponse } from "next/server";
import {
  getEvidentiaryStats,
  getCandidateQueue,
  approveCandidate,
  mergeCandidate,
  rejectCandidate,
} from "@/lib/evidence-service";
import { getAuditTrail } from "@/lib/ingestion/audit";

function authenticateAdminRequest(req: Request): { isAuthorized: boolean; editorActor: string } {
  const authHeader = req.headers.get("authorization");
  const sessionSecret = process.env.SESSION_SECRET;

  // In production, enforce token or secret presence if configured
  if (process.env.NODE_ENV === "production" && sessionSecret) {
    if (!authHeader || !authHeader.includes(sessionSecret)) {
      return { isAuthorized: false, editorActor: "Unauthorized" };
    }
  }

  // Derive editor actor from authenticated header or default to verified editor
  const customActor = req.headers.get("x-editor-user");
  const editorActor = customActor && /^[a-zA-Z0-9 ._-]{3,50}$/.test(customActor)
    ? customActor
    : "Authenticated Senior Editor";

  return { isAuthorized: true, editorActor };
}

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
    const auth = authenticateAdminRequest(req);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Valid admin credentials required for review actions" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, candidateId, targetEventId, reason } = body;

    if (!candidateId || typeof candidateId !== "string") {
      return NextResponse.json({ success: false, error: "Missing required candidateId" }, { status: 400 });
    }

    const editorActor = auth.editorActor;

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
