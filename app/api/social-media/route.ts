import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { insert, selectAll } from "@/lib/db";

export async function GET() {
  try {
    const items = await selectAll(
      "social_media",
      { userId: 1 },
      { column: "order", ascending: true },
    );

    return NextResponse.json(items || []);
  } catch (error) {
    console.error("[v0] GET social media", error);
    return NextResponse.json(
      { error: "Failed to fetch social media" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { platform, url, order = 0 } = body;

    if (!platform || !url) {
      return NextResponse.json(
        { error: "platform and url required" },
        { status: 400 },
      );
    }

    await insert("social_media", {
      userId: 1,
      platform,
      url,
      order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] POST social media", error);
    return NextResponse.json(
      { error: "Failed to create social media" },
      { status: 500 },
    );
  }
}
