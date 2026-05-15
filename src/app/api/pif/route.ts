import { NextResponse } from "next/server";
import { fetchPif } from "@/lib/sources/pif";

export const revalidate = 120;

export async function GET() {
  const data = await fetchPif();
  if (!data) return NextResponse.json({ error: "Failed to fetch PIF data" }, { status: 500 });
  return NextResponse.json(data);
}
