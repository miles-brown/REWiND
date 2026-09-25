import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import {
  getEvidentiaryStats,
  getCandidateQueue,
  approveCandidate,
  mergeCandidate,
  rejectCandidate,
  ingestSampleCandidateStream,
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
  z.object({
    action: z.literal("ingest_sample"),
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

function verifySignedActor(token: string, secret: string): string | null {
  const colonIdx = token.lastIndexOf(":");
  if (colonIdx === -1) return null;
  const actor = token.slice(0, colonIdx);
  const signature = token.slice(colonIdx + 1);
  if (!actor || !signature) return null;
  const expectedSig = crypto.createHmac("sha256", secret).update(actor).digest("hex");
  if (timingSafeCompare(signature, expectedSig)) {
    return /^[\p{L}\p{N} ._'’-]{3,60}$/u.test(actor) ? actor : null;
  }
  return null;
}

function deriveVerifiedActor(req: Request, token: string, sessionSecret?: string): string {
  if (sessionSecret) {
    // 1. Check if the authenticated token is signed (username:hmacSignature)
    if (token) {
      const signedActor = verifySignedActor(token, sessionSecret);
      if (signedActor) return signedActor;
    }

    // 2. Check for HMAC signed editor header
    const customActor = req.headers.get("x-editor-user");
    const actorSig = req.headers.get("x-editor-signature");
    if (customActor && actorSig) {
      const expectedSig = crypto.createHmac("sha256", sessionSecret).update(customActor).digest("hex");
      if (timingSafeCompare(actorSig, expectedSig) && /^[\p{L}\p{N} ._'’-]{3,60}$/u.test(customActor)) {
        return customActor;
      }
    }
  }

  return process.env.ADMIN_ACTOR || "Authenticated Senior Editor";
}

function authenticateAdminRequest(req: Request): { isAuthorized: boolean; editorActor: string } {
  const authHeader = req.headers.get("authorization");
  const sessionSecret = process.env.SESSION_SECRET;

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

  // In production, enforce constant-time bearer token or cookie verification against SESSION_SECRET (strictly fail-closed)
  if (process.env.NODE_ENV === "production") {
    if (!sessionSecret) {
      return { isAuthorized: false, editorActor: "Unauthorized: Admin access not configured" };
    }

    if (!token) {
      return { isAuthorized: false, editorActor: "Unauthorized" };
    }

    const isDirectMatch = timingSafeCompare(token, sessionSecret);
    const signedActor = verifySignedActor(token, sessionSecret);

    if (!isDirectMatch && !signedActor) {
      return { isAuthorized: false, editorActor: "Unauthorized" };
    }
  }

  const editorActor = deriveVerifiedActor(req, token, sessionSecret);
  return { isAuthorized: true, editorActor };
}

import type { ApiErrorResponse } from "@/lib/rewind";

export async function GET(req: Request) {
  try {
    const auth = authenticateAdminRequest(req);
    if (!auth.isAuthorized) {
      const errorBody: ApiErrorResponse = {
        success: false,
        error: "Unauthorized: Valid admin credentials required for evidence data",
        code: "UNAUTHORIZED",
      };
      return NextResponse.json(errorBody, { status: 401 });
    }

    const stats = await getEvidentiaryStats();
    const queue = await getCandidateQueue();
    const audit = await getAuditTrail();

    return NextResponse.json({
      stats,
      queue,
      audit,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    const errorBody: ApiErrorResponse = {
      success: false,
      error: message,
      code: "INTERNAL_SERVER_ERROR",
    };
    return NextResponse.json(errorBody, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = authenticateAdminRequest(req);
    if (!auth.isAuthorized) {
      const errorBody: ApiErrorResponse = {
        success: false,
        error: "Unauthorized: Valid admin credentials required for review actions",
        code: "UNAUTHORIZED",
      };
      return NextResponse.json(errorBody, { status: 401 });
    }

    const body = await req.json();
    const parsed = AdminReviewActionSchema.safeParse(body);
    if (!parsed.success) {
      const errorBody: ApiErrorResponse = {
        success: false,
        error: "Invalid request payload",
        code: "BAD_REQUEST",
        details: parsed.error.format(),
      };
      return NextResponse.json(errorBody, { status: 400 });
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

    if (data.action === "ingest_sample") {
      const res = await ingestSampleCandidateStream(editorActor);
      if (!res.success) {
        return NextResponse.json(res, { status: 400 });
      }
      return NextResponse.json(res, { status: 200 });
    }

    const errorBody: ApiErrorResponse = {
      success: false,
      error: "Invalid action",
      code: "BAD_ACTION",
    };
    return NextResponse.json(errorBody, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    const errorBody: ApiErrorResponse = {
      success: false,
      error: message,
      code: "INTERNAL_SERVER_ERROR",
    };
    return NextResponse.json(errorBody, { status: 500 });
  }
}

