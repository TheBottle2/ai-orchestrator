import { NextResponse } from "next/server";
// Mesaj gonderme endpointi: pipeline calisir ve sohbet guncellenir
import mongoose from "mongoose";
import { connectDB } from "../../../../../core/db.js";
import { ChatManager } from "../../../../../features/chat/chat.manager.js";
import { MessageSendSchema } from "../../../../../features/chat/dto/chat.dto.js";
import { getAuthUserId } from "../../../../../lib/auth.js";

const m = new ChatManager();

export async function POST(req, { params }) {
try {
const { id } = await params;

if (!id || !mongoose.Types.ObjectId.isValid(id)) {
return NextResponse.json(
{ mesaj: "Geçerli bir Chat ID gerekli" },
{ status: 400 }
);
}

await connectDB();
const kullanici_id = getAuthUserId(req);

let body;
try {
body = await req.json();
} catch {
return NextResponse.json({ mesaj: "Geçersiz JSON body" }, { status: 400 });
}

const { mesaj, baslik } = MessageSendSchema.parse(body);

const chat = await m.getSession(id);
if (!chat || String(chat.kullanici_id) !== String(kullanici_id)) {
return NextResponse.json({ mesaj: "Yetkisiz" }, { status: 403 });
}

const result = await m.sendMessage(id, mesaj, baslik);
return NextResponse.json(result);

} catch (e) {
if (e.name === "ZodError") {
return NextResponse.json(
{ hatalar: e.errors },
{ status: 400 }
);
}
if (e.status === 401) {
return NextResponse.json({ mesaj: "Yetkisiz" }, { status: 401 });
}
return NextResponse.json(
{ mesaj: e.message },
{ status: 500 }
);
}
}
