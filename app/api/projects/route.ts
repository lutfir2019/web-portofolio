import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "4", 10);
    const featured = searchParams.get("featured");

    const offset = (page - 1) * limit;

    // Build query
    let query: any = supabase.from("projects").select("*", { count: "exact" });

    // Apply filters
    if (featured === "true") {
      query = query.eq("featured", true);
    }

    // Get total count
    const { count } = await query;

    // Get paginated data
    const { data, error } = await query
      .order("order", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
    });
  } catch (error) {
    console.error("[v0] GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
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
    const {
      title,
      description,
      image,
      technologies,
      liveLink,
      githubLink,
      featured,
    } = data;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // 🔥 Ambil order terakhir
    const { data: lastProject } = await supabase
      .from("projects")
      .select("order")
      .order("order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = lastProject ? lastProject.order + 1 : 1;

    // 🚀 Insert dengan order baru
    const { data: newProject, error } = await supabase
      .from("projects")
      .insert([
        {
          userId: 1,
          title,
          description: description || "",
          image: image || "",
          technologies: technologies || "",
          liveLink: liveLink || "",
          githubLink: githubLink || "",
          featured: Boolean(featured),
          order: nextOrder, // ✅ tambahkan ini
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { success: true, data: newProject },
      { status: 201 },
    );
  } catch (error) {
    console.error("[v0] POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
