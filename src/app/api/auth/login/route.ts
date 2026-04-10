import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const pin =
      typeof body === "object" && body !== null && "pin" in body
        ? String((body as Record<string, unknown>)["pin"])
        : "";

    const expected = process.env.AEGIS_OPERATOR_PIN ?? "";
    if (!expected || pin !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await createSessionToken();

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "strict",
      path:     "/",
      maxAge:   8 * 60 * 60, // 8 hours
      // secure: true — omit for localhost dev; add when behind HTTPS
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
