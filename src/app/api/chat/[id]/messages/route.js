import { NextResponse } from "next/server";
import { connectDB } from "../../../../../core/db.js";
import { ChatManager } from "../../../../../features/chat/chat.manager.js";
import { MessageSendSchema } from "../../../../../features/chat/dto/chat.dto.js";

const m = new ChatManager();

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { mesaj: "Chat ID gerekli" },
        { status: 400 }
      );
    }
    
    await connectDB();
    const body = await req.json();
    const { mesaj } = MessageSendSchema.parse(body);
    
    const result = await m.sendMessage(id, mesaj);
    return NextResponse.json(result);
    
  } catch (e) {
    if (e.name === "ZodError") {
      return NextResponse.json(
        { hatalar: e.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { mesaj: e.message },
      { status: 500 }
    );
  }
}