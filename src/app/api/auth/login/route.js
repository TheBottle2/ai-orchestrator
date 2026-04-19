import { NextResponse } from "next/server";
import { connectDB } from "../../../../core/db.js";
import { UserManager } from "../../../../features/user/user.manager.js";
import { UserLoginSchema } from "../../../../features/user/dto/user.dto.js";

const m = new UserManager();

export async function POST(req) {
  try {
    await connectDB();
    const body  = await req.json();
    const data  = UserLoginSchema.parse(body);
    const sonuc = await m.login(data.email, data.sifre);
    return NextResponse.json(sonuc);
  } catch (e) {
    return NextResponse.json({ mesaj: e.message }, { status: 401 });
  }
}