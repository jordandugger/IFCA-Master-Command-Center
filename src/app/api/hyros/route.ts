import { NextResponse } from "next/server";
import { fetchHyros } from "@/lib/sources/hyros";

export const revalidate = 120;

export async function GET() {
  const data = await fetchHyros();
  if (!data) return NextResponse.json({ error: "Failed to fetch Hyros data" }, { status: 500 });
  return NextResponse.json(data);
}
