import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { deleteFrom, insert, selectAll, update } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");

    const filters: Record<string, any> = {};
    if (category) {
      filters.category = category;
    }

    const skills = await selectAll("skills", filters, {
      column: "order",
      ascending: true,
    });
    return NextResponse.json(skills);
  } catch (error) {
    console.error("[v0] GET /api/skills error:", error);
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await request.json();
    const { name, category, proficiency } = data;

    if (!name) {
      return NextResponse.json({ error: "Skill name is required" }, { status: 400 });
    }

    await insert("skills", {
      userId: 1,
      name,
      category: category || "Other",
      proficiency: proficiency ?? 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] POST /api/skills error:", error);
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await request.json();
    const { id, name, category, proficiency } = data;

    if (!id || !name) {
      return NextResponse.json({ error: "ID and skill name are required" }, { status: 400 });
    }

    await update("skills", { id }, {
      name,
      category: category || "Other",
      proficiency: proficiency ?? 50,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] PUT /api/skills error:", error);
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await deleteFrom("skills", { id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] DELETE /api/skills error:", error);
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}
