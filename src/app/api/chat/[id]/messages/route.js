import { NextResponse } from "next/server";
import { connectDB } from "../../../../../core/db.js";
import { ChatManager } from "../../../../../features/chat/chat.manager.js";
import { MessageSendSchema } from "../../../../../features/chat/dto/chat.dto.js";
import { getAuthUserId } from "../../../../../lib/auth.js";

const m = new ChatManager();

export async function POST(req, { params }) {
  try {
    // Mesaj gonderme: sohbet id'si ve mesaj body'si ile pipeline calisir
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { mesaj: "Chat ID gerekli" },
        { status: 400 }
      );
    }
    
    await connectDB();
    const kullanici_id = getAuthUserId(req);
    const body = await req.json();
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
