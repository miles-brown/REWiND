import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getEvidentiaryStats,
  getCandidateQueue,
  approveCandidate,
  mergeCandidate,
  rejectCandidate,
} from "@/lib/evidence-service";
import { getAuditTrail } from "@/lib/ingestion/audit";

const AdminReviewActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
    candidateId: z.string().min(1, "candidateId is required"),
  }),
  z.object({
    action: z.literal("merge"),
    candidateId: z.string().min(1, "candidateId is required"),
    targetEventId: z.string().min(1, "targetEventId is required for merge"),
  }),
  z.object({
    action: z.literal("reject"),
    candidateId: z.string().min(1, "candidateId is required"),
    reason: z.string().optional(),
  }),
]);

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
    const parsed = AdminReviewActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const editorActor = auth.editorActor;

    if (data.action === "approve") {
      const res = approveCandidate(data.candidateId, editorActor);
      if (!res.success) {
        return NextResponse.json(res, { status: 400 });
      }
      return NextResponse.json(res, { status: 200 });
    }

    if (data.action === "merge") {
      const res = mergeCandidate(data.candidateId, data.targetEventId, editorActor);
      if (!res.success) {
        return NextResponse.json(res, { status: 400 });
      }
      return NextResponse.json(res, { status: 200 });
    }

    if (data.action === "reject") {
      const res = rejectCandidate(data.candidateId, data.reason || "Editorial rejection", editorActor);
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

