import { NextResponse } from "next/server";
import { connectDB } from "../../../core/db.js";
import { ChatManager } from "../../../features/chat/chat.manager.js";
import { ChatCreateSchema } from "../../../features/chat/dto/chat.dto.js";
const m = new ChatManager();
export async function GET(req) {
  try { await connectDB(); const id = new URL(req.url).searchParams.get("kullanici_id"); return NextResponse.json(await m.getSessions(id)); }
  catch (e) { return NextResponse.json({ mesaj: e.message }, { status: 500 }); }
}
export async function POST(req) {
  try { await connectDB(); const b = await req.json(); return NextResponse.json(await m.createSession(b.kullanici_id, ChatCreateSchema.parse(b).baslik), { status: 201 }); }
  catch (e) { return NextResponse.json({ mesaj: e.message }, { status: 400 }); }
}
