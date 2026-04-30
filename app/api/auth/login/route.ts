import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { LoginSchema } from "@/lib/validations";

const COOKIE_MAX_AGE = Number(process.env.JWT_COOKIE_MAX_AGE ?? 900);
const REFRESH_COOKIE_MAX_AGE = Number(process.env.JWT_REFRESH_TOKEN_MAX_AGE ?? 60 * 60 * 24 * 30); // 30 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;

      return NextResponse.json(
        {
          error: Object.values(errors)[0]?.[0] || "Invalid input",
          details: errors,
        },
        { status: 400 },
      );
    }

    const { email, password } = validation.data;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        {
          error: error.message || "Email atau password salah",
        },
        { status: 401 },
      );
    }

    const user = data.user;
    const session = data.session;

    if (!user || !session) {
      return NextResponse.json(
        {
          error: "Login gagal",
        },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || user.email,
      },
      accessToken: session.access_token, // optional, bisa dihapus jika cookie only
    });

    // simpan di httpOnly cookie
    response.cookies.set("access_token", session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    if (session.refresh_token) {
      response.cookies.set("refresh_token", session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_COOKIE_MAX_AGE,
      });
    }

    return response;
  } catch (error) {
    console.error("[v0] Login API error:", error);

    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat login",
      },
      { status: 500 },
    );
  }
}
