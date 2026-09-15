import { searchRewind } from "@/lib/rewind/search";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const rawLimit = searchParams.get("limit");
  const parsedLimit = rawLimit ? Number(rawLimit) : 10;
  const limit = Number.isInteger(parsedLimit) && parsedLimit >= 1
    ? Math.min(Math.max(parsedLimit, 1), 30)
    : 10;

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchRewind(q, limit);
  return NextResponse.json({ results });
}
