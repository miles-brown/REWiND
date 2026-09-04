import { searchRewind } from "@/lib/rewind/search";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchRewind(q, Math.min(limit, 30));
  return NextResponse.json({ results });
}
