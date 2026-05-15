import { NextResponse } from "next/server";
import { fetchBackend } from "@/lib/sources/backend";

export const revalidate = 120;

export async function GET() {
  const data = await fetchBackend();
  if (!data) return NextResponse.json({ error: "Failed to fetch backend data" }, { status: 500 });
  return NextResponse.json(data);
}
