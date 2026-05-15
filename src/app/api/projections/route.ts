import { NextResponse } from "next/server";
import { fetchProjections } from "@/lib/sources/projections";

export const revalidate = 120;

export async function GET() {
  const data = await fetchProjections();
  if (!data) return NextResponse.json({ error: "Failed to fetch projections" }, { status: 500 });
  return NextResponse.json(data);
}
