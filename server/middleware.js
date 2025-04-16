import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token");
  if (!token || token.value !== "admin_token") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/diddys-lounge"],
};
