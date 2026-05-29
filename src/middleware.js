// Next.js middleware - API route'lari icin kimlik dogrulama katmani
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/api/auth/login", "/api/auth/register", "/api/health"];

export async function middleware(req) {
const { pathname } = req.nextUrl;

if (!pathname.startsWith("/api/")) return NextResponse.next();
if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) return NextResponse.next();

const header = req.headers.get("authorization") || "";
const [type, token] = header.split(" ");

if (type !== "Bearer" || !token) {
return NextResponse.json({ mesaj: "Yetkisiz" }, { status: 401 });
}

const secretStr = process.env.JWT_SECRET;
if (!secretStr) {
return NextResponse.json({ mesaj: "Sunucu yapılandırma hatası" }, { status: 500 });
}

try {
const secret = new TextEncoder().encode(secretStr);
await jwtVerify(token, secret);
} catch (err) {
console.error("JWT Doğrulama Hatası:", err.message);
return NextResponse.json({ mesaj: "Yetkisiz" }, { status: 401 });
}

return NextResponse.next();
}

export const config = {
matcher: ["/api/:path*"],
};
