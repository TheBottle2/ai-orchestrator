import { NextResponse } from "next/server";
import { connectDB } from "../../../core/db.js";
import { ChatManager } from "../../../features/chat/chat.manager.js";
import { ChatCreateSchema } from "../../../features/chat/dto/chat.dto.js";

const m = new ChatManager();

export async function GET(req) {
  try {
    await connectDB();
    const id = new URL(req.url).searchParams.get("kullanici_id");
    
    if (!id) {
      return NextResponse.json(
        { mesaj: "kullanici_id parametresi gerekli" },
        { status: 400 }
      );
    }
    
    const result = await m.getSessions(id);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { mesaj: e.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const validated = ChatCreateSchema.parse(body);
    
    const result = await m.createSession(
      validated.kullanici_id,
      validated.baslik
    );
    
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    if (e.name === "ZodError") {
      return NextResponse.json(
        { hatalar: e.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { mesaj: e.message },
      { status: 400 }
    );
  }
}