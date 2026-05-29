import { NextResponse } from "next/server";

// Tüm API route'lari icin tutarli hata yonetimi utility'si
export function handleApiError(e) {
if (e.name === "ZodError") {
return NextResponse.json({ hatalar: e.errors }, { status: 400 });
}
if (e.status === 401) {
return NextResponse.json({ mesaj: "Yetkisiz" }, { status: 401 });
}
return NextResponse.json({ mesaj: e.message }, { status: 500 });
}
