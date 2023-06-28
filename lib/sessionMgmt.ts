import cookie from "cookie";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET!;

export function setSession(res: NextResponse, session: any) {
  const token = jwt.sign(session, secret);
  const cookieValue = cookie.serialize("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60, // 5 min
    sameSite: "strict",
    path: "/",
  });
  // res.cookies
  res.headers.set("Set-Cookie", cookieValue);
}

export function getSession(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}

export function destroySession(res: { setHeader: (arg0: string, arg1: string) => void }) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      sameSite: "strict",
      path: "/",
    })
  );
}
