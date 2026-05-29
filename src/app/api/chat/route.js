import { NextResponse } from "next/server";
// Sohbet listeleme ve yeni sohbet olusturma endpointleri
import { connectDB } from "../../../core/db.js";
import { ChatManager } from "../../../features/chat/chat.manager.js";
import { ChatCreateSchema } from "../../../features/chat/dto/chat.dto.js";
import { getAuthUserId } from "../../../lib/auth.js";
import { handleApiError } from "../../../lib/api-error.js";

const m = new ChatManager();

export async function GET(req) {
try {
await connectDB();
const kullanici_id = getAuthUserId(req);
const result = await m.getSessions(kullanici_id);
return NextResponse.json(result);
} catch (e) {
return handleApiError(e);
}
}

export async function POST(req) {
try {
await connectDB();
const kullanici_id = getAuthUserId(req);

let body;
try {
body = await req.json();
} catch {
return NextResponse.json({ mesaj: "Geçersiz JSON body" }, { status: 400 });
}

const validated = ChatCreateSchema.parse(body);

const result = await m.createSession(
kullanici_id,
validated.baslik,
validated.models
);

return NextResponse.json(result, { status: 201 });
} catch (e) {
return handleApiError(e);
}
}
