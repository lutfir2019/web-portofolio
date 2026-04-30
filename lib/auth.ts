import { cookies } from "next/headers";
import { deleteFrom, hashPassword, insert, selectOne } from "./db";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "portfolio_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface SessionData {
  userId: number;
  email: string;
  fullName: string;
  createdAt: number;
}

const CRYPTO_SALT = process.env.CRYPTO_SALT;

async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const salt = Number(CRYPTO_SALT ?? 10);
  const hashedPassword = await hashPassword(password, salt);
  return hashedPassword === hash;
}

export async function login(email: string, password: string) {
  try {
    const user = await selectOne("users", { email });

    if (!user) {
      return { error: "Email atau password salah" };
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return { error: "Email atau password salah" };
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION / 1000,
      path: "/",
    });

    await insert("sessions", {
      id: sessionToken,
      userId: user.id,
      expiresAt: Date.now() + SESSION_DURATION,
    });

    return {
      success: true,
      user: { id: user.id, email: user.email, fullName: user.fullName },
    };
  } catch (error) {
    console.error("[v0] Login error:", error);
    return { error: "Terjadi kesalahan saat login" };
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      await deleteFrom("sessions", { id: sessionToken }).catch(() => undefined);
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
    return { success: true };
  } catch (error) {
    console.error("[v0] Logout error:", error);
    return { error: "Terjadi kesalahan saat logout" };
  }
}

export async function getCurrentUser(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const session = await selectOne("sessions", { id: sessionToken });
    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await selectOne("users", { id: session.userId });
    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: Date.now(),
    };
  } catch (error) {
    console.error("[v0] Get current user error:", error);
    return null;
  }
}

export async function verifyAuth() {
  const user = await getCurrentUser();
  return user || null;
}
