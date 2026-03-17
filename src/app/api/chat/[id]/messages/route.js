import { NextResponse } from "next/server";
import { connectDB } from "../../../../../core/db.js";
import { ChatManager } from "../../../../../features/chat/chat.manager.js";
import { MessageSendSchema } from "../../../../../features/chat/dto/chat.dto.js";

export const maxDuration = 600;

const m = new ChatManager();

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const { mesaj } = MessageSendSchema.parse(body);
    const result = await m.sendMessage(id, mesaj);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ mesaj: e.message }, { status: 500 });
  }
}
