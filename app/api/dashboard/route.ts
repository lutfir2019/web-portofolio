import { NextRequest, NextResponse } from "next/server";
import { count } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const projects = await count("projects");
    const experience = await count("experience");
    const skills = await count("skills");
    const blog = await count("blog_posts");

    return NextResponse.json({
      projects,
      experience,
      skills,
      blog,
    });
  } catch (error) {
    console.error("[v0] GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
