import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { selectOne, upsert } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const profile = await selectOne("profile", { userId: 1 });
    return NextResponse.json(profile || {});
  } catch (error) {
    console.error("[v0] GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await request.json();
    const { title, bio, profileImage, location, phone, email, fullName } = data;

    await upsert(
      "profile",
      {
        userId: 1,
        title: title || "",
        bio: bio || "",
        profileImage: profileImage || "",
        location: location || "",
        phone: phone || "",
        email: email || "",
        fullName: fullName || "",
        updatedAt: new Date().toISOString(),
      },
      "userId",
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] POST /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
