import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    // Lightweight DB call to keep Supabase connection warm.
    // Use a minimal select to avoid returning large data.
    const { data, error } = await supabase.from("projects").select("id").limit(1);

    if (error) {
      console.error("[keep-alive] supabase error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, timestamp: new Date().toISOString(), db: Array.isArray(data) }, { status: 200 });
  } catch (err) {
    console.error("[keep-alive] unexpected error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
