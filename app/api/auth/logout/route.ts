import { NextResponse } from "next/server";
import { supabaseAuth } from "@/lib/db";

export async function POST() {
  try {
    // Sign out from Supabase
    const { error } = await supabaseAuth.auth.signOut();

    if (error) {
      console.error("[v0] Supabase logout error:", error);
      // Continue with cookie clearing even if Supabase logout fails
    }

    const res = NextResponse.json({
      success: true,
    });

    res.cookies.set("access_token", "", {
      expires: new Date(0),
      path: "/",
    });
    res.cookies.set("refresh_token", "", {
      expires: new Date(0),
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("[v0] Logout API error:", error);

    // Still clear the cookie even if there's an error
    const res = NextResponse.json({
      success: false,
      error: "Terjadi kesalahan saat logout",
    }, { status: 500 });

    res.cookies.set("access_token", "", {
      expires: new Date(0),
      path: "/",
    });
    res.cookies.set("refresh_token", "", {
      expires: new Date(0),
      path: "/",
    });

    return res;
  }
}
