import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { deleteFrom, insert, selectAll, supabase, update } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const experience = await selectAll(
      "experience",
      {},
      {
        column: "startDate",
        ascending: false,
      },
    );
    return NextResponse.json(experience);
  } catch (error) {
    console.error("[v0] GET /api/experience error:", error);
    return NextResponse.json(
      { error: "Failed to fetch experience" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await request.json();
    const {
      jobTitle,
      company,
      startDate,
      endDate,
      currentlyWorking,
      description,
    } = data;

    if (!jobTitle || !company || !startDate) {
      return NextResponse.json(
        { error: "Job title, company, and start date are required" },
        { status: 400 },
      );
    }

    // 🔥 Ambil order terakhir
    const { data: lastExperience } = await supabase
      .from("experience")
      .select("order")
      .order("order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = lastExperience ? lastExperience.order + 1 : 1;

    // 🚀 Insert dengan order
    await insert("experience", {
      userId: 1,
      jobTitle,
      company,
      startDate,
      endDate: endDate || "",
      currentlyWorking: Boolean(currentlyWorking),
      description: description || "",
      order: nextOrder, // ✅ tambahkan ini
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] POST /api/experience error:", error);
    return NextResponse.json(
      { error: "Failed to create experience" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await request.json();
    const {
      id,
      jobTitle,
      company,
      startDate,
      endDate,
      currentlyWorking,
      description,
      order,
    } = data;

    if (!id || !jobTitle || !company || !startDate) {
      return NextResponse.json(
        { error: "ID, job title, company, and start date are required" },
        { status: 400 },
      );
    }

    await update(
      "experience",
      { id },
      {
        jobTitle,
        company,
        startDate,
        endDate: endDate || "",
        currentlyWorking: Boolean(currentlyWorking),
        description: description || "",
        order: order,
        updatedAt: new Date().toISOString(),
      },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] PUT /api/experience error:", error);
    return NextResponse.json(
      { error: "Failed to update experience" },
      { status: 500 },
    );
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

    await deleteFrom("experience", { id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] DELETE /api/experience error:", error);
    return NextResponse.json(
      { error: "Failed to delete experience" },
      { status: 500 },
    );
  }
}
