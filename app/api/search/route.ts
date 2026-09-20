import { searchRewind } from "@/lib/rewind/search";
import type { ApiErrorResponse } from "@/lib/rewind/types";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const rawLimit = searchParams.get("limit");
  const parsedLimit = rawLimit ? Number(rawLimit) : 10;
  const limit = Number.isInteger(parsedLimit) && parsedLimit >= 1
    ? Math.min(Math.max(parsedLimit, 1), 30)
    : 10;

  if (q.length > 200) {
    const errorBody: ApiErrorResponse & { results: [] } = {
      results: [],
      error: "Search query is too long",
      code: "QUERY_TOO_LONG",
    };
    return NextResponse.json(errorBody, { status: 400 });
  }

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchRewind(q, limit);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API error:", error);
    const errorBody: ApiErrorResponse & { results: [] } = {
      results: [],
      error: "Search service unavailable",
      code: "SERVICE_UNAVAILABLE",
    };
    return NextResponse.json(errorBody, { status: 503 });
  }
}

