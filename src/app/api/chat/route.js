import { NextResponse } from "next/server";
import { connectDB } from "../../../core/db.js";
import { ChatManager } from "../../../features/chat/chat.manager.js";
import { ChatCreateSchema } from "../../../features/chat/dto/chat.dto.js";
import { getAuthUserId } from "../../../lib/auth.js";

const m = new ChatManager();

export async function GET(req) {
  try {
    // Kullaniciya ait sohbetleri getirir (token ile dogrulama)
    await connectDB();
    const kullanici_id = getAuthUserId(req);
    const result = await m.getSessions(kullanici_id);
    return NextResponse.json(result);
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

export async function POST(req) {
  try {
    // Yeni sohbet oturumu olusturur (token ile dogrulama)
    await connectDB();
    const kullanici_id = getAuthUserId(req);
    const body = await req.json();
    const validated = ChatCreateSchema.parse(body);

    const result = await m.createSession(
      kullanici_id,
      validated.baslik,
      validated.models
    );

    return NextResponse.json(result, { status: 201 });
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
      { status: 400 }
    );
  }
}
