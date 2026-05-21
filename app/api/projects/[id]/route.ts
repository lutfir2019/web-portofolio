import { NextRequest, NextResponse } from "next/server";
import { deleteFrom, selectOne, update } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const project = await selectOne("projects", { id });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[v0] GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const data = await request.json();
    const {
      title,
      description,
      image,
      technologies,
      liveLink,
      githubLink,
      featured,
      order,
    } = data;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const existingProject = await selectOne("projects", { id });
    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await update(
      "projects",
      { id },
      {
        title,
        description: description || "",
        image: image || "",
        technologies: technologies || "",
        liveLink: liveLink || "",
        githubLink: githubLink || "",
        featured: Boolean(featured),
        order: order,
        updatedAt: new Date().toISOString(),
      },
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[v0] PUT /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireAuth(_request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const existingProject = await selectOne("projects", { id });
    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await deleteFrom("projects", { id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
