import { NextRequest, NextResponse } from "next/server";
import { deleteFrom, selectOne, update } from "@/lib/db";

const USER_ID = 1;
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const item = await selectOne("social_media", { id, userId: USER_ID });
    if (!item) {
      return NextResponse.json(
        { error: "Social media not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("[GET /social_media/:id]", error);
    return NextResponse.json({ error: "Failed fetch data" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { platform, url, order = 0 } = body;

    if (!platform?.trim() || !url?.trim()) {
      return NextResponse.json(
        { error: "Platform and url are required" },
        { status: 400 },
      );
    }

    const existing = await selectOne("social_media", {
      id,
      userId: USER_ID,
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Social media not found" },
        { status: 404 },
      );
    }

    await update("social_media", { id, userId: USER_ID }, {
      platform: platform.trim(),
      url: url.trim(),
      order,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Social media updated successfully",
    });
  } catch (error) {
    console.error("[PUT /social_media/:id]", error);
    return NextResponse.json(
      { error: "Failed update social" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await selectOne("social_media", { id, userId: USER_ID });
    if (!existing) {
      return NextResponse.json(
        { error: "Social media not found" },
        { status: 404 },
      );
    }

    await deleteFrom("social_media", { id, userId: USER_ID });
    return NextResponse.json({
      success: true,
      message: "Social media deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /social_media/:id]", error);
    return NextResponse.json(
      { error: "Failed delete social" },
      { status: 500 },
    );
  }
}
