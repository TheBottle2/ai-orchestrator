import { NextResponse } from "next/server";
import { connectDB } from "../../../../core/db.js";
import { UserManager } from "../../../../features/user/user.manager.js";
import { UserCreateSchema } from "../../../../features/user/dto/user.dto.js";

const m = new UserManager();

export async function POST(req) {
  try {
    await connectDB();
    const body    = await req.json();
    const data    = UserCreateSchema.parse(body);
    const sonuc   = await m.register(data);
    return NextResponse.json(sonuc, { status: 201 });
  } catch (e) {
    return NextResponse.json({ mesaj: e.errors || e.message }, { status: 400 });
  }
}