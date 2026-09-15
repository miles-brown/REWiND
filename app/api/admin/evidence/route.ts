import { NextResponse } from "next/server";
import crypto from "node:crypto";
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

function timingSafeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    // Constant-time dummy comparison to prevent length timing leaks
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function authenticateAdminRequest(req: Request): { isAuthorized: boolean; editorActor: string } {
  const authHeader = req.headers.get("authorization");
  const sessionSecret = process.env.SESSION_SECRET;

  // In production, enforce constant-time bearer token or cookie verification against SESSION_SECRET (strictly fail-closed)
  if (process.env.NODE_ENV === "production") {
    if (!sessionSecret) {
      return { isAuthorized: false, editorActor: "Unauthorized: Admin access not configured" };
    }

    let token = "";
    if (authHeader) {
      const match = authHeader.match(/^Bearer\s+(.+)$/i);
      if (match) token = match[1].trim();
    }
    if (!token) {
      const cookieHeader = req.headers.get("cookie") || "";
      const matchCookie = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]+)/);
      if (matchCookie) {
        try {
          token = decodeURIComponent(matchCookie[1].trim());
        } catch {
          token = "";
        }
      }
    }

    if (!token || !timingSafeCompare(token, sessionSecret)) {
      return { isAuthorized: false, editorActor: "Unauthorized" };
    }
  }

  // Derive editor actor supporting international names (e.g., O'Connor, René, Al-Mansoor)
  const customActor = req.headers.get("x-editor-user");
  const editorActor = customActor && /^[\p{L}\p{N} ._'’-]{3,60}$/u.test(customActor)
    ? customActor
    : "Authenticated Senior Editor";

  return { isAuthorized: true, editorActor };
}


export async function GET(req: Request) {
  const auth = authenticateAdminRequest(req);
  if (!auth.isAuthorized) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Valid admin credentials required for evidence data" },
      { status: 401 }
    );
  }

  const stats = await getEvidentiaryStats();
  const queue = await getCandidateQueue();
  const audit = await getAuditTrail();

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
      const res = await approveCandidate(data.candidateId, editorActor);
      if (!res.success) {
        return NextResponse.json(res, { status: 400 });
      }
      return NextResponse.json(res, { status: 200 });
    }

    if (data.action === "merge") {
      const res = await mergeCandidate(data.candidateId, data.targetEventId, editorActor);
      if (!res.success) {
        return NextResponse.json(res, { status: 400 });
      }
      return NextResponse.json(res, { status: 200 });
    }

    if (data.action === "reject") {
      const res = await rejectCandidate(data.candidateId, data.reason || "Editorial rejection", editorActor);
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

