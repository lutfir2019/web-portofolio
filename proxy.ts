import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/db";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];
const PRIVATE_PREFIXES = ["/admin"];
const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

function isPrivatePath(pathname: string) {
  return PRIVATE_PREFIXES.some((path) => pathname.startsWith(path));
}

async function verifyToken(token: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error("Invalid token");
  }
}

async function refreshSession(refreshToken: string) {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data?.session) {
    throw new Error("Refresh failed");
  }
  return data.session;
}

function setSessionCookies(response: NextResponse, session: any) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  if (session.refresh_token) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

async function handleRefresh(
  req: NextRequest,
  response: NextResponse,
  refreshToken: string,
) {
  const session = await refreshSession(refreshToken);
  setSessionCookies(response, session);
  return response;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const isPublic = isPublicPath(pathname);
  const isPrivate = isPrivatePath(pathname);

  // --------------------
  // PUBLIC ROUTES
  // kalau sudah login,
  // jangan ke login lagi
  // --------------------
  if (isPublic) {
    if (token) {
      try {
        await verifyToken(token);
        return NextResponse.redirect(new URL("/admin", req.url));
      } catch {
        if (refreshToken) {
          try {
            const res = await handleRefresh(req, NextResponse.redirect(new URL("/admin", req.url)), refreshToken);
            return res;
          } catch {
            // invalid refresh token, lanjut ke login
          }
        }
      }
    }

    return NextResponse.next();
  }

  // --------------------
  // PRIVATE ROUTES
  // wajib auth
  // --------------------
  if (isPrivate) {
    if (!token) {
      if (refreshToken) {
        try {
          const res = await handleRefresh(req, NextResponse.next(), refreshToken);
          return res;
        } catch (error) {
          console.error("[proxy] refresh error:", error);
        }
      }

      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      await verifyToken(token);
      return NextResponse.next();
    } catch (error) {
      if (refreshToken) {
        try {
          const res = await handleRefresh(req, NextResponse.next(), refreshToken);
          return res;
        } catch (refreshError) {
          console.error("[proxy] refresh error:", refreshError);
        }
      }

      console.error("[proxy]", error);
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete(ACCESS_TOKEN_COOKIE);
      res.cookies.delete(REFRESH_TOKEN_COOKIE);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register", "/forgot-password"],
};
