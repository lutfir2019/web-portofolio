import { NextRequest, NextResponse } from "next/server";
import { deleteFrom, selectOne, update } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const post = await selectOne("blog_posts", { id });

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("[v0] GET /api/blog/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params;
    const data = await request.json();
    const { title, description, url, image, published, publishedAt } = data;

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 },
      );
    }

    const existingPost = await selectOne("blog_posts", { id });
    if (!existingPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 },
      );
    }

    await update("blog_posts", { id }, {
      title,
      description: description || "",
      url,
      image: image || "",
      published: Boolean(published),
      publishedAt: publishedAt || null,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[v0] PUT /api/blog/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireAuth(_request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params;
    const existingPost = await selectOne("blog_posts", { id });
    if (!existingPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 },
      );
    }

    await deleteFrom("blog_posts", { id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] DELETE /api/blog/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 },
    );
  }
}
