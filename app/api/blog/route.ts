import { NextRequest, NextResponse } from "next/server";
import { insert, selectAll, selectOne } from "@/lib/db";

const USER_ID = 1;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get("published");
    const url = searchParams.get("url");

    if (url) {
      const post = await selectOne("blog_posts", { url });
      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json(post);
    }

    const filters: Record<string, any> = {};
    if (published === "true") {
      filters.published = true;
    }

    const posts = await selectAll("blog_posts", filters, {
      column: "publishedAt",
      ascending: false,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("[GET /api/blog]", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { title, description, url, image, published, publishedAt } = data;

    if (!title?.trim() || !url?.trim()) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 },
      );
    }

    const existing = await selectOne("blog_posts", { url });
    if (existing) {
      return NextResponse.json(
        { error: "URL already exists" },
        { status: 409 },
      );
    }

    const newPost = await insert("blog_posts", {
      userId: USER_ID,
      title,
      description: description || "",
      url,
      image: image || "",
      published: Boolean(published),
      publishedAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, data: newPost },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/blog]", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}
