import { NextResponse } from "next/server";
// Sohbet detayi, baslik guncelleme ve silme endpointleri
import mongoose from "mongoose";
import { connectDB } from "../../../../core/db.js";
import { ChatManager } from "../../../../features/chat/chat.manager.js";
import { getAuthUserId } from "../../../../lib/auth.js";

const m = new ChatManager();

export async function GET(req, { params }) {
try {
await connectDB();
const kullanici_id = getAuthUserId(req);
const { id } = await params;

if (!id || !mongoose.Types.ObjectId.isValid(id)) {
return NextResponse.json(
{ mesaj: "Geçerli bir Chat ID gerekli" },
{ status: 400 }
);
}

const chat = await m.getSession(id);
if (!chat || String(chat.kullanici_id) !== String(kullanici_id)) {
return NextResponse.json({ mesaj: "Yetkisiz" }, { status: 403 });
}

return NextResponse.json(chat);
} catch (e) {
if (e.status === 401) {
return NextResponse.json({ mesaj: "Yetkisiz" }, { status: 401 });
}
return NextResponse.json(
{ mesaj: e.message },
{ status: 500 }
);
}
}

export async function PATCH(req, { params }) {
try {
await connectDB();
const kullanici_id = getAuthUserId(req);
const { id } = await params;

if (!id || !mongoose.Types.ObjectId.isValid(id)) {
return NextResponse.json(
{ mesaj: "Geçerli bir Chat ID gerekli" },
{ status: 400 }
);
}

let body;
try {
body = await req.json();
} catch {
return NextResponse.json({ mesaj: "Geçersiz JSON body" }, { status: 400 });
}

const baslik = (body?.baslik || "").trim();
if (!baslik) {
return NextResponse.json({ mesaj: "Baslik gerekli" }, { status: 400 });
}

const chat = await m.getSession(id);
if (!chat || String(chat.kullanici_id) !== String(kullanici_id)) {
return NextResponse.json({ mesaj: "Yetkisiz" }, { status: 403 });
}

const updated = await m.updateSession(id, baslik);
return NextResponse.json(updated);
} catch (e) {
if (e.status === 401) {
return NextResponse.json({ mesaj: "Yetkisiz" }, { status: 401 });
}
return NextResponse.json(
{ mesaj: e.message },
{ status: 500 }
);
}
}

export async function DELETE(req, { params }) {
try {
await connectDB();
const kullanici_id = getAuthUserId(req);
const { id } = await params;

if (!id || !mongoose.Types.ObjectId.isValid(id)) {
return NextResponse.json(
{ mesaj: "Geçerli bir Chat ID gerekli" },
{ status: 400 }
);
}

const chat = await m.getSession(id);
if (!chat || String(chat.kullanici_id) !== String(kullanici_id)) {
return NextResponse.json({ mesaj: "Yetkisiz" }, { status: 403 });
}

await m.deleteSession(id);
return NextResponse.json({ ok: true });
} catch (e) {
if (e.status === 401) {
return NextResponse.json({ mesaj: "Yetkisiz" }, { status: 401 });
}
return NextResponse.json(
{ mesaj: e.message },
{ status: 500 }
);
}
}
