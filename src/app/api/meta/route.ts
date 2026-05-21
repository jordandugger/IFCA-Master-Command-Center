import { NextResponse } from "next/server";
import { fetchMeta } from "@/lib/sources/meta";

export const revalidate = 120;

export async function GET() {
  const data = await fetchMeta();
  if (!data) return NextResponse.json({ error: "Failed to fetch Meta data" }, { status: 500 });
  return NextResponse.json(data);
}
